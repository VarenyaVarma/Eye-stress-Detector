import torch.nn as nn
import torchvision.models as models

def SimpleNN():
    # ✅ Define ResNet18 exactly as it was trained
    model = models.resnet18(weights=None)

    # ✅ The model was trained for 2 classes (since fc.weight = [2, 512])
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 2)

    return model
