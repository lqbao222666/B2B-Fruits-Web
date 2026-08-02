<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TinNhanService, { type Conversation, type Message } from '@/service/tinnhan.ts'
import { notify } from '@/utils/notifier.ts'

const route = useRoute()
const router = useRouter()

const conversations = ref<Conversation[]>([])
const activePartnerId = ref<number | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const newMessageAttachments = ref<any[]>([])
const isUploadingAttachment = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isLoadingConversations = ref(false)
const isLoadingMessages = ref(false)
const isSending = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const openMedia = (url: string) => {
  window.open(url, '_blank')
}

const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

const currentUserId = computed(() => currentUser.value?.user_id || currentUser.value?.id)

const fetchConversations = async () => {
  try {
    const data = await TinNhanService.getConversations()
    conversations.value = data
  } catch (error) {
    console.error('Failed to load conversations', error)
  }
}

const fetchMessages = async (partnerId: number) => {
  try {
    const data = await TinNhanService.getConversation(partnerId)
    // Avoid re-rendering if messages are exactly the same (simple length check for polling)
    if (messages.value.length !== data.length || messages.value[messages.value.length - 1]?.tinnhan_id !== data[data.length - 1]?.tinnhan_id) {
      messages.value = data
      scrollToBottom()
      
      // Mark unread messages as read
      const unreadMessages = data.filter(m => m.nguoi_nhan_id === currentUserId.value && !m.da_doc)
      for (const msg of unreadMessages) {
        await TinNhanService.markAsRead(msg.tinnhan_id)
      }
      
      // Refresh conversations to clear badges
      if (unreadMessages.length > 0) {
        fetchConversations()
      }
    }
  } catch (error) {
    console.error('Failed to load messages', error)
  }
}

const searchPhone = ref('')
const searchResult = ref<any>(null)
const searchHistory = ref<any[]>([])
const showSearchDropdown = ref(false)

const loadSearchHistory = () => {
  const h = localStorage.getItem('chatSearchHistory')
  if (h) {
    try {
      searchHistory.value = JSON.parse(h)
    } catch(e) {}
  }
}

const handleSearchPhone = async () => {
  if (!searchPhone.value.trim()) return;
  try {
    const user = await TinNhanService.searchUserByPhone(searchPhone.value.trim());
    searchResult.value = { ...user, phone: searchPhone.value.trim() };
    showSearchDropdown.value = true;
  } catch (err: any) {
    searchResult.value = null;
    notify.error('Không tìm thấy người dùng với SĐT này');
  }
}

const handleSelectSearchUser = async (user: any) => {
  // Add to history
  const newHistory = searchHistory.value.filter(u => u.user_id !== user.user_id);
  newHistory.unshift(user);
  if (newHistory.length > 10) newHistory.pop();
  searchHistory.value = newHistory;
  localStorage.setItem('chatSearchHistory', JSON.stringify(newHistory));

  showSearchDropdown.value = false;
  searchPhone.value = '';
  searchResult.value = null;

  await selectConversation(user.user_id);
  fetchConversations();
}

const clearSearchHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('chatSearchHistory');
}

// Click outside to close dropdown
const handleGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.search-container')) {
    showSearchDropdown.value = false;
  }
}

const selectConversation = async (partnerId: number) => {
  activePartnerId.value = partnerId
  isLoadingMessages.value = true
  await fetchMessages(partnerId)
  isLoadingMessages.value = false
  // Update URL without reloading
  router.replace({ path: '/messages', query: { partnerId } })
}

const getAvatarUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${path}`;
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleSend = async () => {
  if ((!newMessage.value.trim() && newMessageAttachments.value.length === 0) || !activePartnerId.value) return
  
  isSending.value = true
  try {
    await TinNhanService.sendMessage(activePartnerId.value, newMessage.value.trim(), undefined, newMessageAttachments.value)
    newMessage.value = ''
    newMessageAttachments.value = []
    await fetchMessages(activePartnerId.value)
    fetchConversations()
  } catch (error) {
    notify.error('Lỗi khi gửi tin nhắn')
  } finally {
    isSending.value = false
  }
}

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  isUploadingAttachment.value = true;
  try {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      const res = await TinNhanService.uploadFile(file);
      newMessageAttachments.value.push(res);
    }
  } catch (error) {
    notify.error('Lỗi khi tải file lên');
  } finally {
    isUploadingAttachment.value = false;
    target.value = '';
  }
}

import socketService from '@/service/socket';

const activePartner = computed(() => {
  if (!activePartnerId.value) return null
  return conversations.value.find(c => c.partnerId === activePartnerId.value)?.partner
})

const handleNewMessage = (message: any) => {
  // Check if we are currently chatting with the sender
  if (activePartnerId.value === message.nguoi_gui_id) {
    messages.value.push(message)
    scrollToBottom()
    // Mark it as read
    TinNhanService.markAsRead(message.tinnhan_id).then(() => {
      fetchConversations()
    })
  } else {
    // If not, just refresh conversations to update the unread count/badge
    fetchConversations()
  }
}

onMounted(async () => {
  if (!currentUser.value) {
    router.push('/login')
    return
  }
  
  isLoadingConversations.value = true
  await fetchConversations()
  isLoadingConversations.value = false

  const queryPartnerId = route.query.partnerId
  if (queryPartnerId) {
    const pId = parseInt(queryPartnerId as string)
    await selectConversation(pId)
  } else if (conversations.value.length > 0) {
    await selectConversation(conversations.value[0].partnerId)
  }

  socketService.on('new_message', handleNewMessage)

  loadSearchHistory()
  window.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  socketService.off('new_message', handleNewMessage)
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<template>
  <div class="h-[calc(100vh-80px)] mt-20 max-w-7xl mx-auto px-4 pb-4">
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex h-full">
      
      <!-- ════════ LEFT PANE: CONVERSATIONS ════════ -->
      <div class="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/50" :class="{ 'hidden md:flex': activePartnerId }">
        <div class="p-6 border-b border-slate-100">
          <h1 class="text-2xl font-extrabold text-slate-800">Tin nhắn</h1>
          <p class="text-slate-500 text-sm mt-1">Kết nối và trao đổi nhanh chóng</p>
          
          <div class="mt-4 relative search-container">
            <input 
              v-model="searchPhone" 
              @keyup.enter="handleSearchPhone"
              @focus="showSearchDropdown = true"
              type="text" 
              placeholder="Nhập SĐT để bắt đầu nhắn tin..." 
              class="w-full bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:bg-white transition-colors"
            />
            <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-[20px]">search</span>
            
            <!-- Search Dropdown -->
            <div 
              v-if="showSearchDropdown && (searchResult || searchHistory.length > 0)"
              class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
            >
              <!-- Search Result -->
              <div v-if="searchResult">
                <div class="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kết quả tìm kiếm
                </div>
                <div 
                  @click="handleSelectSearchUser(searchResult)"
                  class="p-3 hover:bg-[#f0f8e6] cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img v-if="searchResult.avatar_url" :src="getAvatarUrl(searchResult.avatar_url)" class="w-full h-full object-cover"/>
                    <div v-else class="w-full h-full flex items-center justify-center text-[#2E7D32] font-bold bg-[#E8F5E9]">
                      {{ searchResult.full_name.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div>
                    <div class="font-bold text-sm text-slate-800">{{ searchResult.full_name }}</div>
                    <div class="text-xs text-slate-500">{{ searchResult.phone }}</div>
                  </div>
                </div>
              </div>
              
              <!-- History -->
              <div v-if="!searchResult && searchHistory.length > 0">
                <div class="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch sử</span>
                  <button @click="clearSearchHistory" class="text-xs text-[#2E7D32] hover:underline font-medium">Xóa</button>
                </div>
                <div class="max-h-[250px] overflow-y-auto custom-scrollbar">
                  <div 
                    v-for="(hist, idx) in searchHistory" :key="idx"
                    @click="handleSelectSearchUser(hist)"
                    class="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img v-if="hist.avatar_url" :src="getAvatarUrl(hist.avatar_url)" class="w-full h-full object-cover"/>
                      <div v-else class="w-full h-full flex items-center justify-center text-[#2E7D32] font-bold bg-[#E8F5E9]">
                        {{ hist.full_name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-sm text-slate-800">{{ hist.full_name }}</div>
                      <div class="text-xs text-slate-500">{{ hist.phone || 'SĐT' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div v-if="isLoadingConversations" class="p-6 flex justify-center">
            <span class="animate-spin border-4 border-[#2E7D32]/30 border-t-[#2E7D32] rounded-full w-8 h-8"></span>
          </div>
          
          <div v-else-if="conversations.length === 0" class="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <span class="material-symbols-outlined text-3xl text-slate-400">forum</span>
            </div>
            <p class="font-medium text-[15px]">Chưa có cuộc trò chuyện nào.</p>
            <p class="text-xs text-slate-400">Tin nhắn mới sẽ xuất hiện ở đây</p>
          </div>

          <div v-else class="py-2">
            <div 
              v-for="conv in conversations" 
              :key="conv.partnerId"
              @click="selectConversation(conv.partnerId)"
              class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors relative"
              :class="activePartnerId === conv.partnerId ? 'bg-[#f0f8e6]' : 'hover:bg-slate-100/70'"
            >
              <!-- Indicator for active -->
              <div v-if="activePartnerId === conv.partnerId" class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2E7D32] rounded-r-md"></div>

              <!-- Avatar -->
              <div class="relative w-14 h-14 rounded-full bg-slate-200 border-2 border-white shadow-sm flex-shrink-0 overflow-hidden">
                <img v-if="conv.partner.avatar_url" :src="getAvatarUrl(conv.partner.avatar_url)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-[#2E7D32] font-bold text-lg bg-[#E8F5E9]">
                  {{ conv.partner.full_name.charAt(0).toUpperCase() }}
                </div>
                <!-- Unread badge -->
                <span v-if="conv.unreadCount > 0" class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
                </span>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold text-[15px] truncate" :class="conv.unreadCount > 0 ? 'text-[#2E7D32]' : 'text-slate-800'">{{ conv.partner.full_name }}</h3>
                  <span class="text-[11px] font-medium text-slate-400 flex-shrink-0 ml-2">
                    {{ formatTime(conv.lastMessage.thoi_gian) }}
                  </span>
                </div>
                <p 
                  class="text-sm truncate" 
                  :class="conv.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'"
                >
                  {{ conv.lastMessage.nguoi_gui_id === currentUserId ? 'Bạn: ' : '' }}{{ conv.lastMessage.noi_dung }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════ RIGHT PANE: ACTIVE CHAT ════════ -->
      <div class="flex-1 flex flex-col bg-white relative" :class="{ 'hidden md:flex': !activePartnerId }">
        
        <!-- Welcome Screen (No active chat) -->
        <div v-if="!activePartnerId" class="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center z-20">
          <div class="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mb-6 relative animate-bounce-slow">
            <span class="material-symbols-outlined text-[#2E7D32] text-7xl">chat_bubble</span>
            <div class="absolute -bottom-2 -right-2 w-12 h-12 bg-[#E8F5E9] rounded-full border-4 border-white flex items-center justify-center">
              <span class="material-symbols-outlined text-[#2E7D32] text-xl">handshake</span>
            </div>
          </div>
          <h2 class="text-2xl font-black text-slate-800 mb-2">Xin chào!</h2>
          <p class="text-slate-500 max-w-sm text-center text-sm leading-relaxed">Chọn một cuộc trò chuyện ở danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới từ trang sản phẩm.</p>
        </div>

        <template v-if="activePartnerId">
          <!-- Chat Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-md shadow-sm z-10 sticky top-0">
            <!-- Mobile back button -->
            <button @click="activePartnerId = null" class="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>

            <!-- Partner Info -->
            <div class="w-11 h-11 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm relative">
              <img v-if="activePartner?.avatar_url" :src="getAvatarUrl(activePartner.avatar_url)" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-[#2E7D32] font-bold text-lg bg-[#E8F5E9]">
                {{ activePartner?.full_name?.charAt(0).toUpperCase() || '?' }}
              </div>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ activePartner?.full_name || 'Đang tải...' }}</h3>
              <p class="text-xs text-green-600 font-medium flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Đang hoạt động
              </p>
            </div>
          </div>

          <!-- Messages Area -->
          <div 
            ref="messagesContainer" 
            class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#F8FAFC]/50 custom-scrollbar relative"
          >
            <div v-if="isLoadingMessages" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <span class="animate-spin border-4 border-[#2E7D32]/30 border-t-[#2E7D32] rounded-full w-8 h-8"></span>
            </div>
            
            <template v-else>
              <div class="text-center text-xs text-slate-400 font-medium my-4 bg-slate-100 inline-block mx-auto px-4 py-1.5 rounded-full">
                Bắt đầu cuộc trò chuyện
              </div>

              <div 
                v-for="(msg, index) in messages" 
                :key="msg.tinnhan_id"
                class="flex flex-col max-w-[75%]"
                :class="msg.nguoi_gui_id === currentUserId ? 'self-end items-end' : 'self-start items-start'"
              >
                <!-- Avatar & Bubble -->
                <div class="flex items-end gap-2 group">
                  <!-- Partner Avatar -->
                  <div v-if="msg.nguoi_gui_id !== currentUserId && (index === messages.length - 1 || messages[index+1].nguoi_gui_id === currentUserId)" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-slate-200 shadow-sm hidden sm:block">
                    <img v-if="activePartner?.avatar_url" :src="getAvatarUrl(activePartner.avatar_url)" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-xs">
                      {{ activePartner?.full_name?.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <!-- Bubble -->
                  <div 
                    class="px-5 py-3 text-[15px] leading-relaxed shadow-sm relative flex flex-col gap-2"
                    :class="[
                      msg.nguoi_gui_id === currentUserId 
                        ? 'bg-[#2E7D32] text-white rounded-2xl rounded-br-sm' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm ml-0 sm:ml-10'
                    ]"
                  >
                    <span v-if="msg.noi_dung">{{ msg.noi_dung }}</span>
                    <!-- Attachments -->
                    <template v-if="msg.attachments && msg.attachments.length > 0">
                      <div v-for="(att, i) in msg.attachments" :key="i" class="rounded-lg overflow-hidden max-w-full">
                        <img v-if="att.type === 'image'" :src="getAvatarUrl(att.url)" class="max-w-[200px] max-h-[200px] object-cover cursor-pointer" @click="openMedia(getAvatarUrl(att.url))"/>
                        <video v-else-if="att.type === 'video'" :src="getAvatarUrl(att.url)" controls class="max-w-[200px] max-h-[200px] object-contain bg-black"></video>
                      </div>
                    </template>
                  </div>
                </div>
                <!-- Time -->
                <span class="text-[10px] text-slate-400 mt-1 px-1 font-medium select-none" :class="msg.nguoi_gui_id === currentUserId ? 'mr-2' : 'ml-12'">
                  {{ formatTime(msg.thoi_gian) }}
                </span>
              </div>
            </template>
          </div>
          
          <!-- Chat Input -->
          <div class="p-4 border-t border-slate-100 bg-white">
            
            <!-- Attachments preview -->
            <div v-if="newMessageAttachments.length > 0" class="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar">
              <div v-for="(att, idx) in newMessageAttachments" :key="idx" class="relative rounded-lg overflow-hidden border border-slate-200 w-20 h-20 flex-shrink-0 group">
                <img v-if="att.type === 'image'" :src="getAvatarUrl(att.url)" class="w-full h-full object-cover" />
                <video v-else-if="att.type === 'video'" :src="getAvatarUrl(att.url)" class="w-full h-full object-cover"></video>
                <button @click="newMessageAttachments.splice(idx, 1)" class="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6">
                  <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            </div>

            <div class="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-[#2E7D32] focus-within:bg-white focus-within:shadow-sm transition-all">
              <button 
                @click="triggerFileInput" 
                class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#2E7D32] hover:bg-[#E8F5E9] rounded-xl flex-shrink-0 transition-colors"
                title="Đính kèm file"
              >
                <span v-if="isUploadingAttachment" class="animate-spin border-2 border-slate-300 border-t-[#2E7D32] rounded-full w-5 h-5"></span>
                <span v-else class="material-symbols-outlined">attach_file</span>
              </button>
              
              <textarea 
                v-model="newMessage" 
                placeholder="Nhập tin nhắn..." 
                class="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 max-h-32 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 custom-scrollbar min-h-[44px]"
                rows="1"
                @keydown.enter.prevent="handleSend"
                @input="(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }"
              ></textarea>
              
              <button 
                @click="handleSend"
                :disabled="(!newMessage.trim() && newMessageAttachments.length === 0) || isSending"
                class="w-10 h-10 flex items-center justify-center bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <span v-if="isSending" class="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5"></span>
                <span v-else class="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            
            <input type="file" ref="fileInput" class="hidden" multiple accept="image/*,video/*" @change="handleFileSelect" />
          </div>
        </template>
    </div>
  </div>
  </div>
</template>

<style scoped>
/* Thay đổi scrollbar cho tinh tế hơn */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #94a3b8;
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(-5%);
  }
  50% {
    transform: translateY(0);
  }
}
.animate-bounce-slow {
  animation: bounceSlow 3s infinite ease-in-out;
}
</style>
