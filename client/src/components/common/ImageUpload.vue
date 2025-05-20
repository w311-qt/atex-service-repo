<template>
  <div class="image-upload">
    <div
      class="upload-zone"
      :class="{ 'has-image': imageUrl, 'drag-over': isDragging }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="file-input"
        @change="onFileChange"
      >

      <div v-if="imageUrl" class="image-preview">
        <img :src="imageUrl" alt="Preview" class="preview-img">
        <div class="overlay">
          <v-btn icon small color="error" @click.stop="removeImage">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-else class="placeholder">
        <v-icon size="48" color="grey lighten-1">mdi-image-plus</v-icon>
        <div class="text-caption mt-2">
          {{ placeholder || 'Нажмите или перетащите изображение' }}
        </div>
      </div>

      <v-progress-linear
        v-if="uploading"
        :value="uploadProgress"
        color="primary"
        class="upload-progress"
      ></v-progress-linear>
    </div>

    <v-alert
      v-if="error"
      type="error"
      text
      dense
      class="mt-2"
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ImageUpload',

  props: {
    value: {
      type: [String, File, Object], // Accept both String and File types
      default: null
    },
    placeholder: {
      type: String,
      default: 'Нажмите или перетащите изображение'
    },
    equipmentId: {
      type: String,
      default: null
    },
    uploadUrl: {
      type: String,
      default: '/files/upload'
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB
    }
  },

  data() {
    return {
      imageUrl: null,
      file: null,
      isDragging: false,
      uploading: false,
      uploadProgress: 0,
      error: null
    };
  },

  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        if (!newValue) {
          this.imageUrl = null;
          return;
        }

        // If value is a File object (from local selection)
        if (newValue instanceof File) {
          this.file = newValue;
          // Create a local URL for the file
          this.createFilePreview(newValue);
          return;
        }

        // If value is a string (from API)
        if (typeof newValue === 'string') {
          // If the image is already a complete URL
          if (newValue.startsWith('http')) {
            this.imageUrl = newValue;
          }
          // If it's a relative path from API
          else {
            this.imageUrl = `${process.env.VUE_APP_API_URL || ''}/files/${newValue}`;
          }
          return;
        }
      }
    }
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onDragOver(e) {
      this.isDragging = true;
    },

    onDragLeave(e) {
      this.isDragging = false;
    },

    onDrop(e) {
      this.isDragging = false;
      if (e.dataTransfer.files.length) {
        this.processFile(e.dataTransfer.files[0]);
      }
    },

    onFileChange(e) {
      if (e.target.files.length) {
        this.processFile(e.target.files[0]);
      }
    },

    processFile(file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        this.error = 'Выбранный файл не является изображением';
        return;
      }

      // Validate file size
      if (file.size > this.maxSize) {
        this.error = `Размер файла превышает ${this.maxSize / (1024 * 1024)}MB`;
        return;
      }

      this.error = null;
      this.file = file;

      // Create preview
      this.createFilePreview(file);

      // Automatically upload if equipment ID is provided
      if (this.equipmentId) {
        this.uploadImage();
      } else {
        this.$emit('input', file);
        this.$emit('change', file);
      }
    },

    createFilePreview(file) {
      // Create preview from File object
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async uploadImage() {
      if (!this.file) return;

      this.uploading = true;
      this.uploadProgress = 0;
      this.error = null;

      const formData = new FormData();
      formData.append('file', this.file);

      try {
        // Special handling if we're uploading directly to equipment
        let uploadEndpoint = this.uploadUrl;
        if (this.equipmentId) {
          uploadEndpoint = `/equipment/${this.equipmentId}/image`;
        }

        const response = await api.post(uploadEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        });

        // Emit the uploaded filename
        this.$emit('input', response.data.image || response.data.filename);
        this.$emit('uploaded', response.data);

        // Wait a bit to show 100% progress
        setTimeout(() => {
          this.uploading = false;
        }, 500);
      } catch (error) {
        console.error('Upload error:', error);
        this.error = error.response?.data?.message || 'Ошибка при загрузке изображения';
        this.uploading = false;
      }
    },

    removeImage() {
      this.imageUrl = null;
      this.file = null;
      this.$refs.fileInput.value = '';
      this.$emit('input', null);
      this.$emit('remove');
    }
  }
};
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-zone {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #2196F3;
}

.upload-zone.drag-over {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.05);
}

.upload-zone.has-image {
  border-style: solid;
}

.file-input {
  display: none;
}

.placeholder {
  text-align: center;
  color: #757575;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.overlay {
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .overlay {
  opacity: 1;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>