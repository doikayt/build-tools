export interface PluginOption {
    flag: string
    description: string
    requiresValue?: boolean
}

export interface PluginDescriptor {
    name: string
    description: string
    options: PluginOption[]
    validate?(config: unknown): void
}