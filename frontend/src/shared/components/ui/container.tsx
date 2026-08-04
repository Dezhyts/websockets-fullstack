import { memo, ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface ContainerProps {
    className?: string
    children: ReactNode
    'data-testid'?: string
}

export const Container = memo((props: ContainerProps) => {
    const {
        className,
        children,
        'data-testid': dataTestId = 'Container'
    } = props

    return (
        <div
            className={cn(
                ' max-w-375 mx-auto sm:px-6 lg:px-8 xl:px-12 ',
                className
            )}
            data-testid={dataTestId}
        >
            {children}
        </div>
    )
})

Container.displayName = 'Container'
