# Flask application entry point and app factory

from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.restaurants import restaurants_bp

def create_app() -> Flask: # type: ignore
    # Create and configure the Flask application instance
    app = Flask(__name__, static_folder='static') # Needs to point to static directory
    
    # Need to enable cross origin resource sharing
    CORS(app) 
    
    app.register_blueprint(restaurants_bp, url_prefix="/api/restaurants")

    # Define the home route
    @app.route('/')
    def home():
        # Flask needs to know to look inside static for index
        return app.send_static_file('index.html')

    return app

# This part is for running it on your own computer
if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

""""curl -i -X POST http://127.0.0.1:5000/api/restaurants/search \
  -H "Content-Type: application/json" \pwdp
  -d '{"lat":51.4743,"lon":-0.0354,"radius_m":1500}'"""
# Should return restaurants within 1500 metres of Goldsmiths.