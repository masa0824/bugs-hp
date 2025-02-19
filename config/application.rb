require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Myapp
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    config.time_zone = 'Tokyo'
    config.active_record.default_timezone = :local
    
    # バリデーションの日本語化
    config.i18n.default_locale = :ja

    # add custom validators path
    config.autoload_paths += Dir["#{config.root}/app/validators"]

    #config.action_view.field_error_proc = Proc.new do |html_tag, instance|
    #  %Q(#{html_tag}).html_safe
    #end
    config.action_view.field_error_proc = Proc.new {
      |html_tag, instance| %(<span class="field_with_errors">#{html_tag}</span>).html_safe 
    }
  end
end
