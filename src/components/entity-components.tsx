import { AlertTriangle, Loader2Icon, MoreVerticalIcon, PackageOpenIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type EntityHeaderProps = {
    title: string;
    description?: string;
    newButtonLabel?: string;
    disabled?: boolean;
    isCreating?: boolean;

} & (
        | { onNew: () => void; newButtonHref?: never }
        | { newButtonHref: string; onNew?: never }
        | { onNew?: never; newButtonHref?: never }
    );

export const EntityHeader = ({
    title,
    description,
    newButtonLabel,
    disabled,
    isCreating,
    onNew,
    newButtonHref,
}: EntityHeaderProps) => {
    return (
        <div className="flex justify-between items-center gap-x-4">
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {onNew && !newButtonHref && (
                <Button size={"sm"} onClick={onNew} disabled={disabled || isCreating}>
                    <PlusIcon />
                    {newButtonLabel}
                </Button>
            )}
            {newButtonHref && !onNew && (
                <Button asChild size={"sm"}>
                    <Link href={newButtonHref}>
                        <PlusIcon />
                        {newButtonLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
};

type EntityContainerProps = {
    children?: React.ReactNode;
    header?: React.ReactNode;
    search?: React.ReactNode;
    pagination?: React.ReactNode;
};

export const EntityContainer = ({
    children,
    header,
    search,
    pagination,
}: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-7xl w-full flex flex-col gap-y-8 h-full">
                {header}
                {search}
                <div className="flex-1 flex-col gap-y-4 h-full">
                    {children}
                </div>
                {pagination}
            </div>
        </div>
    )
}

type EntitySearchProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;

}

export const EntitySearch = ({ value, onChange, placeholder = "Search...", }: EntitySearchProps) => {
    return (
        <div className="relative ml-auto">
            <SearchIcon className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input className="max-w-56 bg-background shadow-none border-border pl-8"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)} />
        </div>
    );
};

type EntityPaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export const EntityPagination = ({ page, totalPages, onPageChange, disabled }: EntityPaginationProps) => {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button className="flex items-center gap-x-2" disabled={page === totalPages} size={"sm"} variant={"outline"} onClick={() => onPageChange(page + 1)}>Next</Button>
                <Button className="flex items-center gap-x-2" disabled={page === 1} size={"sm"} variant={"outline"} onClick={() => onPageChange(page - 1)}>Previous</Button>
            </div>
        </div>

    )
};

type StateViewProps = {
    message?: string;
};

type LoadingViewProps = StateViewProps & {
    entity?: string;
};

export const LoadingView = ({ entity = "items", message, }: LoadingViewProps) => {
    return (
        <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4 text-muted-foreground">
            <Loader2Icon className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
                {message || `Loading ${entity}...`}
            </p>

        </div>
    );
};


export const ErrorView = ({ message }: StateViewProps) => {
    return (
        <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4 text-muted-foreground">
            <AlertTriangle className="size-6 text-red-500" />
            {!!message && (
                <p className="text-sm text-muted-foreground">
                    {message}
                </p>
            )}
        </div>
    );
};

interface EmptyViewProps extends StateViewProps {
    onNew?: () => void;
};
export const EmptyView = ({ message, onNew }: EmptyViewProps) => {
    return (
        <Empty className="border border-dashed bg-white">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <PackageOpenIcon />
                </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
                No items yet
            </EmptyTitle>
            <EmptyDescription>
                {message}
            </EmptyDescription>
            {!!onNew && (
                <EmptyContent>
                    <Button onClick={onNew}>
                        Add Items
                    </Button>
                </EmptyContent>
            )}

        </Empty>
    )
};

interface EntityListProps<T> {
    items: T[]
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey?: (itesms: T, index: number) => string | number;
    emptyView?: React.ReactNode;
    className?: string;
}

export const EntityList = <T,>({ items,
    renderItem,
    getKey,
    emptyView,
    className,
}: EntityListProps<T>) => {
    if (items.length === 0 && emptyView) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <div className="max-w-sm mx-auto">{emptyView}</div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-y-4", className)}>
            {items.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    )
}

interface EntityItemProps {
    href: string;
    title: string;
    subtitle?: React.ReactNode;
    image?: React.ReactNode;
    actions?: React.ReactNode;
    onRemove?: () => void | Promise<void>;
    isRemoving?: boolean;
    className?: string;
}

export const EntityItem = (
    { href, title, subtitle, image, actions, onRemove, isRemoving, className, }: EntityItemProps
) => {
    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isRemoving) {
            return;
        }

        if (onRemove) {
            await onRemove();
        }
    }
    return (
        <Link href={href} prefetch>
            <Card className={cn("p-4 shadow-none hover:shadow cursor-pointer",
                isRemoving && "opacity-50 cursor-not-allowed",
                className,
            )}>
                <CardContent className="flex flex-row items-center justify-between p-0">
                    <div className="flex items-center gap-3">
                        {image}
                        <div>
                            <CardTitle className="text-base font-medium">
                                {title}
                            </CardTitle>
                            {!!subtitle && (
                                <CardDescription className="text-xs">
                                    {subtitle}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    {(actions || onRemove) &&
                        (<div className="flex gap-x-4 items-center">
                            {actions}
                            {onRemove && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon"
                                            variant={"ghost"}
                                            onClick={(e) => e.stopPropagation()}>
                                            <MoreVerticalIcon className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end"
                                        onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={handleRemove}>
                                            <Trash2Icon className="size-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>)}
                </CardContent>
            </Card>
        </Link>
    )
};