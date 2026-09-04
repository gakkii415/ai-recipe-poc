#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "date"

REQUIRED = %w[
  id title description date category cuisine tags prep_minutes cook_minutes
  servings difficulty ingredients author generator prompt_version batch_id
  review_status published
].freeze

ALLOWED_STATUS = %w[unreviewed reviewed rejected].freeze
errors = []
ids = {}
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

  id = data["id"].to_s
  errors << "#{path}: id が重複しています (#{id})" if ids.key?(id)
  ids[id] = path

  errors << "#{path}: ファイル名は YYYY-MM-DD-slug.md にしてください" unless File.basename(path).match?(/\A\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md\z/)
  errors << "#{path}: ingredients は2件以上の配列にしてください" unless data["ingredients"].is_a?(Array) && data["ingredients"].length >= 2
  errors << "#{path}: tags は配列にしてください" unless data["tags"].is_a?(Array)
  %w[prep_minutes cook_minutes servings].each do |key|
    errors << "#{path}: #{key} は0以上の整数にしてください" unless data[key].is_a?(Integer) && data[key] >= 0
  end
  errors << "#{path}: review_status は #{ALLOWED_STATUS.join('/')} のいずれかです" unless ALLOWED_STATUS.include?(data["review_status"])
  errors << "#{path}: published は true/false で指定してください" unless [true, false].include?(data["published"])
  errors << "#{path}: 本文に『## 作り方』が必要です" unless source.include?("## 作り方")
end

if errors.any?
  warn "Validation failed (#{errors.length})"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "Validated #{files.length} recipe post(s)."

