#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "date"

REQUIRED = %w[
  content_id title description date category cuisine tags prep_minutes cook_minutes
  servings difficulty ingredients author generator prompt_version batch_id
  review_status published
].freeze
ALLOWED_STATUS = %w[unreviewed reviewed rejected].freeze
V2_DIFFICULTY = %w[かんたん ふつう].freeze
LEGACY_V2_KEYS = %w[id slug prep_time cook_time total_time].freeze

errors = []
ids = {}
titles = {}
v2_ids = []
v2_batches = Hash.new(0)
files = Dir["_posts/*.md"].sort
errors << "_posts に記事がありません" if files.empty?

files.each do |path|
  source = File.read(path, encoding: "UTF-8")
  match = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  unless match
    errors << "#{path}: YAML front matter がありません"
    next
  end

  begin
    data = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: false) || {}
  rescue Psych::SyntaxError => e
    errors << "#{path}: YAML error: #{e.message.lines.first.strip}"
    next
  end

  missing = REQUIRED.reject { |key| data.key?(key) && !data[key].nil? }
  errors << "#{path}: 必須項目不足: #{missing.join(', ')}" unless missing.empty?

  content_id = data["content_id"].to_s
  errors << "#{path}: content_id が重複しています (#{content_id})" if ids.key?(content_id)
  ids[content_id] = path
  title = data["title"].to_s.strip
  errors << "#{path}: title が重複しています (#{title})" if titles.key?(title)
  titles[title] = path unless title.empty?

  errors << "#{path}: ファイル名は YYYY-MM-DD-slug.md にしてください" unless File.basename(path).match?(/\A\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md\z/)
  errors << "#{path}: ingredients は2件以上の配列にしてください" unless data["ingredients"].is_a?(Array) && data["ingredients"].length >= 2
  errors << "#{path}: tags は配列にしてください" unless data["tags"].is_a?(Array)
  %w[prep_minutes cook_minutes servings].each do |key|
    errors << "#{path}: #{key} は0以上の整数にしてください" unless data[key].is_a?(Integer) && data[key] >= 0
  end
  errors << "#{path}: review_status は #{ALLOWED_STATUS.join('/')} のいずれかです" unless ALLOWED_STATUS.include?(data["review_status"])
  errors << "#{path}: published は true/false で指定してください" unless [true, false].include?(data["published"])
  errors << "#{path}: 本文に『## 作り方』が必要です" unless source.include?("## 作り方")

  next unless data["prompt_version"] == "v2-pipeline"

  v2_ids << content_id
  v2_batches[data["batch_id"].to_s] += 1
  errors << "#{path}: v2 content_id は recipe-v2-NNN 形式です" unless content_id.match?(/\Arecipe-v2-\d{3}\z/)
  errors << "#{path}: difficulty は #{V2_DIFFICULTY.join('/')} のいずれかです" unless V2_DIFFICULTY.include?(data["difficulty"])
  legacy = LEGACY_V2_KEYS.select { |key| data.key?(key) }
  errors << "#{path}: v2では旧キーを使えません: #{legacy.join(', ')}" unless legacy.empty?
  errors << "#{path}: 本文に『## コツ』が必要です" unless source.include?("## コツ")
  last_line = source.lines.map(&:strip).reject(&:empty?).last.to_s
  errors << "#{path}: 末尾に引用形式の安全注記が必要です" unless last_line.start_with?(">")
end

v2_batches.each do |batch_id, count|
  errors << "#{batch_id}: 1生成タスクは最大5記事です (#{count}件)" if count > 5
end

numbers = v2_ids.filter_map { |id| id[/\Arecipe-v2-(\d{3})\z/, 1]&.to_i }.sort
unless numbers.empty?
  missing_numbers = (numbers.min..numbers.max).to_a - numbers
  errors << "v2 content_id に欠番があります: #{missing_numbers.map { |n| format('%03d', n) }.join(', ')}" unless missing_numbers.empty?
end

if errors.any?
  warn "Validation failed (#{errors.length})"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "Validated #{files.length} recipe post(s), including #{v2_ids.length} v2 pipeline post(s)."
