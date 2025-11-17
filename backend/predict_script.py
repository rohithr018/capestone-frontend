import cv2
import numpy as np
import torch
import torchvision.transforms as transforms

# ---- Preprocessing Function ----
def preprocess_image(img):
    """CLAHE + denoise preprocessing."""
    if img is None:
        raise ValueError("Image is None")

    if img.dtype != np.uint8:
        imgf = img.astype(np.float32)
        imgf = imgf - imgf.min()
        if imgf.max() > 0:
            imgf = imgf / imgf.max()
        img = (imgf * 255).astype(np.uint8)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    img_enh = clahe.apply(img)

    img_denoised = cv2.GaussianBlur(img_enh, (5,5), 0)
    return img_denoised


# ---- Transform for Model ----
transform_test = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])


# ---- Class Labels ----
classes = ['S1', 'S10', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9']
