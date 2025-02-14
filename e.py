import json
import cv2
import numpy as np
import requests
import os

# Noto Emoji base URL (replace with local path if downloaded)
NOTO_EMOJI_URL = "https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/"

# File containing all emojis as a single string
EMOJI_FILE = "emojis.txt"
OUTPUT_FILE = "emoji_colors.json"

def extract_emojis(text):
    """Splits a string into individual emojis."""
    return [char for char in text]

def emoji_to_unicode(emoji):
    """Converts an emoji into Unicode filename format for Noto Emoji."""
    return "emoji_u" + '_'.join(f"{ord(c):x}" for c in emoji) + ".png"

def get_average_color(image_data):
    """Computes the average color (RGB) of an image."""
    img_array = np.asarray(bytearray(image_data), dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        return None  # Failed to process image

    avg_color = img.mean(axis=(0, 1))  # BGR format
    return [int(avg_color[2]), int(avg_color[1]), int(avg_color[0])]  # Convert to RGB

# Read emojis from file
with open(EMOJI_FILE, "r", encoding="utf-8") as f:
    emoji_text = f.read().strip()

emoji_list = extract_emojis(emoji_text)

emoji_colors = {}

for emoji in emoji_list:
    unicode_filename = emoji_to_unicode(emoji)
    image_url = f"{NOTO_EMOJI_URL}{unicode_filename}"

    try:
        response = requests.get(image_url)
        if response.status_code == 200:
            avg_color = get_average_color(response.content)
            if avg_color:
                emoji_colors[emoji] = {"unicode": unicode_filename, "color": avg_color}
                print(f"Processed {emoji} ({unicode_filename}): {avg_color}")
            else:
                print(f"Skipped {emoji} ({unicode_filename}): Image processing failed.")
        else:
            print(f"Skipped {emoji} ({unicode_filename}): Image not found.")
    except Exception as e:
        print(f"Error processing {emoji} ({unicode_filename}): {e}")

# Save the emoji-color mapping to a JSON file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(emoji_colors, f, indent=4, ensure_ascii=False)

print("✅ Done! Emoji color mapping saved to", OUTPUT_FILE)
