from functools import wraps

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_token = request.headers.get('Authorization')
        # Verify token logic
        if not valid_token(auth_token):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

# Apply to routes:
@app.route("/admin/stats")
@admin_required
def get_stats():
    # ...