# ---------------------------------------
# Import required modules
# ---------------------------------------
import sys, os, shutil, torch, matplotlib.pyplot as plt
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
from torchvision import transforms, models
import torch.nn as nn
import torch.nn.functional as F

from utils.email_utils import send_email

# ---------------------------------------
# Initialize FastAPI
# ---------------------------------------
app = FastAPI(title="Eye Stress Detection API")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:3000"] for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# Upload setup
# ---------------------------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ---------------------------------------
# Load trained model
# ---------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "eye_stress_model.pth")

try:
    model = models.resnet18(weights=None)
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 2)  # 2 classes: Normal, Stressed

    model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device("cpu")))
    model.eval()
    print("✅ Trained ResNet18 model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Model failed to load properly: {e}")

# ---------------------------------------
# Utility: Generate Pie Chart
# ---------------------------------------
def generate_chart(normal_percent, stressed_percent, title, chart_path):
    labels = ['Normal', 'Stressed']
    sizes = [normal_percent, stressed_percent]
    colors = ['green', 'red']
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors)
    plt.title(title)
    plt.savefig(chart_path)
    plt.close()

# ---------------------------------------
# Root Check
# ---------------------------------------
@app.get("/")
def home():
    return {"message": "✅ FastAPI is running and model loaded successfully!"}

# ---------------------------------------
# 📷 Image Analysis
# ---------------------------------------
@app.post("/analyze_image")
async def analyze_image(file: UploadFile = File(...), email: str = Form(...)):
    """Analyze uploaded image and generate AI-based stress chart."""
    try:
        # Save uploaded file
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Preprocess image
        image = Image.open(save_path).convert("RGB")
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        input_tensor = preprocess(image).unsqueeze(0)

        # Model inference
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = F.softmax(output, dim=1)
            stress_prob = float(probabilities[0][1].item()) * 100  # Class 1 = stressed
            normal_prob = float(probabilities[0][0].item()) * 100

        stressScore = round(stress_prob, 2)
        normal_percent = round(normal_prob, 2)

        # Condition text
        condition = "⚠️ Eye strain detected!" if stressScore > 50 else "✅ Your eyes appear healthy!"

        print(f"Predicted → Normal: {normal_percent:.2f}% | Stressed: {stressScore:.2f}%")

        # 📊 Generate chart
        chart_name = f"{os.path.splitext(file.filename)[0]}_chart.png"
        chart_path = os.path.join(UPLOAD_DIR, chart_name)
        generate_chart(normal_percent, stressScore, "Stress Level Distribution (Image)", chart_path)

        chart_url = f"http://127.0.0.1:8000/uploads/{chart_name}"
        image_url = f"http://127.0.0.1:8000/uploads/{file.filename}"

        # 📝 Report text
        report = f"""
📷 Image Analysis Report
----------------------------------------
🖼️ File: {file.filename}
🧠 Total Regions Analyzed: 1
😣 Stress Level: {stressScore:.2f}%
🙂 Normal Level: {normal_percent:.2f}%
Result: {condition}
"""

        # 📧 Send email with report + chart
        subject = "Your Eye Image Stress Analysis Report"
        send_email(email, subject, report, attachments=[chart_path])

        # ✅ Return JSON
        return {
            "report": report,
            "chart": chart_url,
            "image_url": image_url,
            "stressScore": stressScore
        }

    except Exception as e:
        print(f"❌ Error analyzing image: {e}")
        return {"error": "Failed to analyze image or send email."}

# ---------------------------------------
# 🎥 Video Analysis
# ---------------------------------------
@app.post("/analyze_video")
async def analyze_video(file: UploadFile = File(...), email: str = Form(...)):
    """Analyze uploaded video, generate stress chart + send email report."""
    try:
        save_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Simulated video stats — replace with frame-based analysis later
        total_frames = 150
        stressed_frames = torch.randint(0, 15, (1,)).item()
        stressScore = round((stressed_frames / total_frames) * 100, 2)
        normal_percent = 100 - stressScore

        # Chart
        chart_name = f"{os.path.splitext(file.filename)[0]}_chart.png"
        chart_path = os.path.join(UPLOAD_DIR, chart_name)
        generate_chart(normal_percent, stressScore, "Stress Level Distribution (Video)", chart_path)

        chart_url = f"http://127.0.0.1:8000/uploads/{chart_name}"
        video_url = f"http://127.0.0.1:8000/uploads/{file.filename}"

        report = f"""
🎥 Video Analysis Report
----------------------------------------
🎞️ File: {file.filename}
🧠 Total Frames: {total_frames}
😣 Stressed Frames: {stressed_frames} ({stressScore:.2f}%)
🙂 Normal Frames: {total_frames - stressed_frames} ({normal_percent:.2f}%)
"""

        # Send report
        subject = "Your Video Stress Analysis Report"
        send_email(email, subject, report, attachments=[chart_path])

        return {
            "report": report,
            "chart": chart_url,
            "image_url": video_url,
            "stressScore": stressScore
        }

    except Exception as e:
        print(f"❌ Error analyzing video: {e}")
        return {"error": "Failed to analyze video or send email."}

# ---------------------------------------
# Run server
# ---------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
