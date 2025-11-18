# model_loader.py
import os
import torch
import torch.nn as nn
from config import MODEL_PATH, NUM_CLASSES, CLASSES

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# -------- Model Definition --------
class ThermalCNN(nn.Module):
    def __init__(self, num_classes=NUM_CLASSES):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        self.conv3 = nn.Conv2d(32, 64, 3, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        self.conv4 = nn.Conv2d(64, 128, 3, padding=1)
        self.bn4 = nn.BatchNorm2d(128)
        self.conv5 = nn.Conv2d(128, 256, 3, padding=1)
        self.bn5 = nn.BatchNorm2d(256)

        self.pool = nn.MaxPool2d(2)
        self.adapt = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(256, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.bn1(self.conv1(x))))
        x = self.pool(self.relu(self.bn2(self.conv2(x))))
        x = self.pool(self.relu(self.bn3(self.conv3(x))))
        x = self.pool(self.relu(self.bn4(self.conv4(x))))
        x = self.pool(self.relu(self.bn5(self.conv5(x))))
        x = self.adapt(x)
        x = torch.flatten(x, 1)
        x = self.fc(x)
        return x


# -------- Load Model --------
def load_model() -> nn.Module:
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model not found: {MODEL_PATH}")
    
    model = ThermalCNN().to(device)

    try:
        ckpt = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    except TypeError:
        ckpt = torch.load(MODEL_PATH, map_location=device)

    state = ckpt["state_dict"] if isinstance(ckpt, dict) and "state_dict" in ckpt else ckpt

    try:
        model.load_state_dict(state, strict=True)
        print("Model loaded with strict=True")
    except:
        print("Strict=True failed, loading with strict=False")
        model.load_state_dict(state, strict=False)

    model.eval()
    return model


# -------- Predict Function --------
def predict_tensor(model, tensor):
    model.eval()
    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)

    label = CLASSES[pred.item()]
    return label, float(conf.item())
