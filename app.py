from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.restaurants import restaurants_bp

def create_app() -> Flask:
    # CHANGE 1: Point 'static_folder' to your actual 'static' directory
    app = Flask(__name__, static_folder='static')
    
    # 1. Initialize CORS for the whole app
    CORS(app) 
    
    # 2. Register your blueprints
    app.register_blueprint(restaurants_bp, url_prefix="/api/restaurants")

    # 3. Define the home route
    @app.route('/')
    def home():
        # CHANGE 2: Flask now knows to look inside 'static' for this file
        return app.send_static_file('index.html')

    return app

# This part is for running it on your own computer
if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)