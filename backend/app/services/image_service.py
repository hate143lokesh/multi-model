import io
import base64
from typing import Tuple, Dict, Any
from PIL import Image
from fastapi import HTTPException, UploadFile, status

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

class ImageService:
    @staticmethod
    async def validate_and_process_upload(file: UploadFile) -> Tuple[bytes, str, Dict[str, Any]]:
        """
        Validates file size, MIME type, and Pillow structural integrity.
        Returns: (file_bytes, mime_type, metadata_dict)
        """
        # 1. Check MIME type header
        content_type = file.content_type or "image/jpeg"
        if content_type.lower() not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Supported formats: JPEG, PNG, WEBP."
            )

        # 2. Read bytes and check size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image size ({len(contents) / (1024*1024):.1f}MB) exceeds the 10MB limit."
            )

        # 3. Validate with Pillow
        try:
            image = Image.open(io.BytesIO(contents))
            image.verify()  # Verify image integrity
            
            # Re-open for metadata inspection since verify closes internal state
            image = Image.open(io.BytesIO(contents))
            width, height = image.size
            img_format = image.format or "JPEG"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid or corrupted image file: {str(e)}"
            )

        # Quality triage check: Flag extremely low-res images
        quality_rating = "High resolution"
        if width < 300 or height < 300:
            quality_rating = "Low resolution (may limit visual triage accuracy)"
        elif width < 800 or height < 800:
            quality_rating = "Medium resolution (adequate for triage)"

        metadata = {
            "width": width,
            "height": height,
            "format": img_format,
            "size_bytes": len(contents),
            "quality_rating": quality_rating
        }

        return contents, content_type, metadata

    @staticmethod
    def encode_base64(image_bytes: bytes) -> str:
        """Encode binary image to base64 string."""
        return base64.b64encode(image_bytes).decode("utf-8")
