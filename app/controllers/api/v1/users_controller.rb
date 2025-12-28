module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!, only: [ :update ]

      def me
        if logged_in?
          render json: { user: user_json(current_user) }
        else
          render json: { user: nil }
        end
      end

      def update
        if current_user.update(user_params)
          render json: { user: user_json(current_user) }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.permit(:name, :avatar_url, :password, :password_confirmation)
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
