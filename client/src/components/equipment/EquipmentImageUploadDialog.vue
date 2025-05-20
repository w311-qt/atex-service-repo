<template>
  <v-dialog v-model="dialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">
        Загрузка изображения
      </v-card-title>

      <v-card-text>
        <p class="mb-4">Загрузите изображение для оборудования "{{ equipmentName }}"</p>
        <image-upload
          v-model="imageFile"
          :equipment-id="equipmentId"
          placeholder="Нажмите или перетащите изображение для загрузки"
          @uploaded="onImageUploaded"
        ></image-upload>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="close">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ImageUpload from '@/components/common/ImageUpload.vue';

export default {
  name: 'EquipmentImageUploadDialog',
  components: {
    ImageUpload
  },
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    equipmentId: {
      type: String,
      required: true
    },
    equipmentName: {
      type: String,
      default: 'оборудования'
    }
  },
  data() {
    return {
      dialogVisible: this.dialog,
      imageFile: null
    };
  },
  watch: {
    dialog(newVal) {
      this.dialogVisible = newVal;
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('close');
      }
    }
  },
  methods: {
    close() {
      this.dialogVisible = false;
      this.imageFile = null;
    },

    onImageUploaded(responseData) {
      this.$emit('uploaded', responseData);

      // Show success message
      this.$store.commit('notification/SHOW_SUCCESS', 'Изображение успешно загружено');

      setTimeout(() => {
        this.close();
      }, 1500);
    }
  }
};
</script>