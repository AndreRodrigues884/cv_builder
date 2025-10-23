<template>
  <div class="space-y-2">
    <p><strong>Nome:</strong> {{ user?.name }}</p>
    <p><strong>Email:</strong> {{ user?.email }}</p>
    <p v-if="profile?.phone"><strong>Telefone:</strong> {{ profile.phone }}</p>
    <p v-if="profile?.location"><strong>Localização:</strong> {{ profile.location }}</p>
    <p v-if="profile?.website"><strong>Website:</strong> {{ profile.website }}</p>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
    profile: Object
  }
}
</script>
