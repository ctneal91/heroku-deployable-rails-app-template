module Api
  module V1
    class SessionsController < ApplicationController
      def create
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
          log_in(user)
          render json: { user: user_json(user) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        log_out
        head :no_content
      end

      private

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
