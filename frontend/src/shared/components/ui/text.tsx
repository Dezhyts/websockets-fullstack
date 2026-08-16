import { memo, ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

export type TextSize =
    | 'xs'
    | 'sm'
    | 'base'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
export type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'span'
export type TextWeight = 'regular' | 'medium' | 'bold' | 'muted'
export type TextColor = 'default' | 'accent' | 'muted' | 'destructive'

const tagBySize: Record<TextSize, TextTag> = {
    xs: 'span',
    sm: 'span',
    base: 'p',
    lg: 'p',
    xl: 'h3',
    '2xl': 'h2',
    '3xl': 'h1',
    '4xl': 'h1'
}

const weightMap: Record<TextWeight, string> = {
    regular: 'font-normal',
    medium: 'font-medium',
    muted: 'font--muted-foreground',
    bold: 'font-bold'
}

const colorMap: Record<TextColor, string> = {
    default: 'text-foreground',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
    destructive: 'text-destructive'
}

const sizeMap: Record<TextSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
}

interface TextProps {
    children?: ReactNode
    className?: string
    size?: TextSize
    as?: TextTag
    weight?: TextWeight
    color?: TextColor
    'data-testid'?: string
}

export const Text = memo((props: TextProps) => {
    const {
        children,
        className,
        size = 'base',
        as,
        color = 'default',
        weight = 'regular',
        'data-testid': dataTestId = 'Text',
        ...rest
    } = props

    if (!children) return null

    const Component = as ?? tagBySize[size]

    return (
        <Component
            data-testid={dataTestId}
            className={cn(
                '',
                sizeMap[size],
                weightMap[weight],
                colorMap[color],
                className
            )}
            {...rest}
        >
            {children}
        </Component>
    )
})

Text.displayName = 'Text'
