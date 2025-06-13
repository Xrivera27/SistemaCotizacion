<template>
  <div class="app-layout">
    <AppSidebar 
      :isOpen="sidebarOpen" 
      @toggle-sidebar="toggleSidebar"
    />
    <div class="main-wrapper" :class="{ 'sidebar-closed': !sidebarOpen }">
      <AppHeader @toggle-sidebar="toggleSidebar" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import AppSidebar from './Sidebar.vue';
import AppHeader from './Header.vue';

export default {
  name: 'AppLayout',
  components: {
    AppSidebar,
    AppHeader
  },
  data() {
    return {
      sidebarOpen: true,
      isMobile: false
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        this.sidebarOpen = false;
      } else {
        this.sidebarOpen = true;
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-wrapper.sidebar-closed {
  margin-left: 70px;
}

.main-content {
  flex: 1;
  background: #f8f9fa;
  overflow-y: auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .main-wrapper,
  .main-wrapper.sidebar-closed {
    margin-left: 0;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>