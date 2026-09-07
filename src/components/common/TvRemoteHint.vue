<script setup lang="ts"></script>

<template>
  <footer
    class="fixed bottom-0 left-0 right-0 z-30 h-10 px-8 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex items-center justify-between text-xs text-slate-400 pointer-events-none select-none"
  >
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span
          class="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-mono font-bold text-slate-200 shadow-sm"
        >
          ▲ ▼ ◀ ▶
        </span>
        <span>Navigate</span>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-2 py-0.5 rounded bg-blue-600/30 border border-blue-500/50 text-[10px] font-mono font-bold text-blue-300 shadow-sm"
        >
          OK / ENTER
        </span>
        <span>Select / Stream</span>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-mono font-bold text-slate-200 shadow-sm"
        >
          BACK / ESC
        </span>
        <span>Return</span>
      </div>
    </div>

    <div class="flex items-center gap-3 text-slate-400">
      <span class="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        10-Foot Leanback Mode
      </span>
      <span class="text-slate-600">|</span>
      <span class="text-slate-400 font-semibold tracking-wider">ARENATV 4K</span>
    </div>
  </footer>
</template>
