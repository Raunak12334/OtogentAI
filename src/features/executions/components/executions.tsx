"use client";

import { formatDistanceToNow } from "date-fns";
import {
    EmptyView,
    EntityContainer,
    EntityHeader,
    EntityItem,
    EntityList,
    EntityPagination,
    ErrorView,
    LoadingView
} from "@/components/entity-components";
import { useSuspenseExecutions } from "../hooks/use-executions"
import { useExecutionParams } from "../hooks/use-executions-params";
import { ExecutionStatus } from "@/generated/prisma/enums";
import type { Execution } from "@/generated/prisma/client";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";

export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) => <ExecutionItem data={execution} />}
            emptyView={<ExecutionsEmpty />}
        />
    );
};

export const ExecutionsHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <EntityHeader
            title="Executions"
            description="Execute and monitor your workflows"
        />
    );
};

export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionParams();

    return (
        <EntityPagination
            disabled={executions.isFetching}
            totalPages={executions.data.totalPages}
            page={executions.data.page}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    );
};

export const ExecutionsContainer = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination />}
        >
            {children}
        </EntityContainer>
    );
};

export const ExecutionsLoading = () => {
    return <LoadingView message="Loading executions..." />;
};

export const ExecutionsError = () => {
    return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
    return (
        <EmptyView
            message="You haven't created any executions yet. Get started by running your first workflow"
        />
    );
};

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className=" size-5 text-green-600" />;
        case ExecutionStatus.FAILED:
            return <XCircleIcon className=" size-5 text-red-600" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className=" size-5 text-blue-600 animate-spin" />;
        default:
            return <ClockIcon className=" size-5 text-blue-600 animate-spin" />;
    }
}

export const ExecutionItem = ({
    data,
}: {
    data: Execution & { workflow: { id: string, name: string } }
}) => {
    const duration = data.completedAt
        ? Math.round(
            (new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000
        )
        : null;
    const subtitle = (
        <>
            {data.workflow.name} &bull; Started{" "}
            {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            {duration !== null && <>&bull; Took {duration}s</>}
        </>
    )
    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={data.status}
            subtitle={subtitle}
            image={
                <div className="size-8 flex items-center justify-center">
                    {getStatusIcon(data.status)}
                </div>
            }
        />
    )
};