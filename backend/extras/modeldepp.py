import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
import matplotlib.pyplot as plt

# Dataset paths (Use absolute paths to avoid errors)
base_dir = r"E:\YashAgarwal\Projects\Garbage-DetectionCopy\backend\extras\dataset"
train_dir = os.path.join(base_dir, "train")
val_dir = os.path.join(base_dir, "val")

# Check if dataset directories exist
if not os.path.exists(train_dir) or not os.path.exists(val_dir):
    raise FileNotFoundError(f"Dataset folders not found! Ensure '{train_dir}' and '{val_dir}' exist.")

# Image parameters
img_size = (224, 224)
batch_size = 32

# Data Augmentation for training data
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255.0,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    shear_range=0.2,
    brightness_range=[0.8, 1.2]
)

# Data preprocessing for validation data (no augmentation)
val_datagen = ImageDataGenerator(rescale=1.0 / 255.0)

# Load training and validation data
train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode="categorical"
)

val_generator = val_datagen.flow_from_directory(
    val_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode="categorical"
)

# Load MobileNetV2 without the top layers
base_model = MobileNetV2(weights="imagenet", include_top=False, input_shape=(224, 224, 3))

# Freeze the base model layers
base_model.trainable = False

# Add custom layers on top of the base model
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation="relu")(x)
output_layer = Dense(2, activation="softmax")(x)  # Explicitly define output layer

# Define the model
model = Model(inputs=base_model.input, outputs=output_layer)  # Use 'output_layer'

# Compile the model
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# Train the model
try:
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=10
    )
except Exception as e:
    print(f"Error during training: {e}")

# Fine-tuning: Unfreeze some layers and recompile
base_model.trainable = True
for layer in base_model.layers[:100]:  # Freeze the first 100 layers
    layer.trainable = False

# Recompile the model with a lower learning rate
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
              loss="categorical_crossentropy",
              metrics=["accuracy"])

# Fine-tune the model
try:
    history_fine = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=5
    )
except Exception as e:
    print(f"Error during fine-tuning: {e}")

# Save the model
try:
    model.save(r"E:\YashAgarwal\Projects\Garbage-DetectionCopy\backend\model_deep.keras")
    print("Model saved successfully.")
except Exception as e:
    print(f"Error saving model: {e}")

# Function to plot accuracy and loss graphs
def plot_training_history(history, fine_tune_history):
    """
    Plots training & validation accuracy and loss.
    Args:
        history: History object from initial training.
        fine_tune_history: History object from fine-tuning.
    """
    acc = history.history["accuracy"] + fine_tune_history.history["accuracy"]
    val_acc = history.history["val_accuracy"] + fine_tune_history.history["val_accuracy"]
    loss = history.history["loss"] + fine_tune_history.history["loss"]
    val_loss = history.history["val_loss"] + fine_tune_history.history["val_loss"]

    epochs_range = range(len(acc))

    plt.figure(figsize=(12, 5))

    # Accuracy plot
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label="Training Accuracy")
    plt.plot(epochs_range, val_acc, label="Validation Accuracy")
    plt.legend()
    plt.xlabel("Epochs")
    plt.ylabel("Accuracy")
    plt.title("Training and Validation Accuracy")

    # Loss plot
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label="Training Loss")
    plt.plot(epochs_range, val_loss, label="Validation Loss")
    plt.legend()
    plt.xlabel("Epochs")
    plt.ylabel("Loss")
    plt.title("Training and Validation Loss")

    plt.show()

# Plot the training graphs
plot_training_history(history, history_fine)