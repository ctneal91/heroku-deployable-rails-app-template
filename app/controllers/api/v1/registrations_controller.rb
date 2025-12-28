module Api
  module V1
    class RegistrationsController < ApplicationController
      def create
        user = User.new(user_params)

        if user.save
          log_in(user)
          render json: { user: user_json(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.permit(:email, :password, :password_confirmation, :name, :avatar_url)
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url
        }
      end
    end
  end
end
