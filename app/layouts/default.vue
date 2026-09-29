<template>
  <div class="flex min-h-screen flex-col bg-white">
    <LayoutAppHeader />
    <div class="flex-1">
      <slot />
    </div>
    <LayoutAppFooter />
  </div>
</template>
