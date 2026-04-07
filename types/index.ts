export interface Team {
  id: string
  name: string
  description: string
  password: string
  created_at: string
}

export interface Document {
  id: string
  team_id: string
  title: string
  content: string
  source_type: 'pdf' | 'word' | 'text' | 'url'
  source_url: string | null
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}
