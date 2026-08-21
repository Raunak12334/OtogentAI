"use client";

import { ExecutionStatus } from "@/generated/prisma/enums";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useSuspenseExecution } from "../hooks/use-executions";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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

export const ExecutiionView = ({ executionId }: { executionId: string }) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStackTrace, setShowStackTrace] = useState(false);
    const duration = execution.completedAt
        ? Math.round(
            (new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000
        )
        : null;
    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                        <CardTitle>
                            {(execution.status)}
                        </CardTitle>
                        <CardDescription>
                            Execution for {execution.workflow.name}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Workflow
                        </p>
                        <Link prefetch className="text-sm text-primary hover:underline" href={`/workflows/${execution.workflowId}`}>
                            {execution.workflow.name}
                        </Link>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Status
                        </p>
                        <p className="text-sm">
                            {execution.status}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Started
                        </p>
                        <p className="text-sm">
                            {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                        </p>
                    </div>
                    {execution.completedAt ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Completed
                            </p>
                            <p className="text-sm">
                                {formatDistanceToNow(execution.completedAt, { addSuffix: true })}
                            </p>
                        </div>
                    ) : null}

                    {duration !== null ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Duration
                            </p>
                            <p className="text-sm">
                                {duration}s
                            </p>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};

