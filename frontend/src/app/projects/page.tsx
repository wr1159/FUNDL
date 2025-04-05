"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import Link from "next/link";
import { createPublicClient, formatEther, http } from "viem";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FundlABI, FundlAddress } from "@/lib/calls";
import type { Project } from "../projects/[id]/page";
import { baseSepolia } from "viem/chains";

// Define a SerializedProject type for the data returned by the API
type SerializedProject = [
    tokenAddress: string,
    owner: string,
    name: string,
    description: string,
    imageUrl: string,
    isInProgress: boolean,
    milestones: string,
    currentMilestone: string,
    goalAmount: string,
    raisedAmount: string,
    currentMilestoneStartTime: string,
    timeLastCollected: string,
    amountCollectedForMilestone: string
];

// Helper to convert serialized project to project type with proper BigInt values
function deserializeProject(serializedProject: SerializedProject): Project {
    return [
        serializedProject[0] as `0x${string}`,
        serializedProject[1] as `0x${string}`,
        serializedProject[2],
        serializedProject[3],
        serializedProject[4],
        serializedProject[5],
        BigInt(serializedProject[6]),
        BigInt(serializedProject[7]),
        BigInt(serializedProject[8]),
        BigInt(serializedProject[9]),
        BigInt(serializedProject[10]),
        BigInt(serializedProject[11]),
        BigInt(serializedProject[12]),
    ] as Project;
}

const ProjectCard = ({ project, id }: { project: Project; id: number }) => {
    // Calculate funding progress percentage
    const progressPercentage =
        project[9] > BigInt(0) && project[8] > BigInt(0)
            ? Math.min(Number((project[9] * BigInt(100)) / project[8]), 100)
            : 0;

    return (
        <div className="w-full">
            <Card className="h-full flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
                {/* Project Image */}
                <div className="relative w-full pt-[100%] border border-black bg-blue-100 overflow-hidden rounded">
                    {project[4] ? (
                        <img
                            src={project[4]}
                            alt={project[2]}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-200 text-black font-bold text-2xl">
                            No Image
                        </div>
                    )}
                </div>

                {/* Project Info */}
                <div className="flex flex-col flex-grow p-4">
                    <h2 className="text-2xl font-extrabold mb-2 truncate">
                        {project[2]}
                    </h2>

                    <p className="text-sm line-clamp-3 mb-4">{project[3]}</p>

                    {/* Milestones */}
                    <div className="mb-2 text-sm">
                        <span className="font-bold">Milestones: </span>
                        <span className="inline-block bg-black text-white px-2 py-1 rounded">
                            {project[7]} / {project[6]}
                        </span>
                    </div>

                    {/* Funding Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold">
                                Progress: {progressPercentage}%
                            </span>
                            <span>
                                {formatEther(project[9])} /{" "}
                                {formatEther(project[8])} ETH
                            </span>
                        </div>
                        <div className="h-6 w-full border-4 border-black bg-white relative">
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* View Project Button */}
                    <div className="mt-auto">
                        <Link href={`/projects/${id}`} passHref>
                            <Button className="w-full">View Project</Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Array<Project | null>>([]);
    const [loading, setLoading] = useState(true);
    const [countLoading, setCountLoading] = useState(true);
    const [projectCount, setProjectCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const projectsPerPage = 6;
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });

    // Fetch project counter
    // const {
    //     data: projectCount,
    //     isLoading: countLoading,
    //     error: countError,
    // } = useReadContract({
    //     address: FundlAddress as `0x${string}`,
    //     abi: FundlABI,
    //     functionName: "projectIdCounter",
    // });
    useEffect(() => {
        async function fetchProjectCount() {
            setCountLoading(true);
            try {
                const count = await publicClient.readContract({
                    address: FundlAddress as `0x${string}`,
                    abi: FundlABI,
                    functionName: "projectIdCounter",
                });
                setProjectCount(count as number);
                setCountLoading(false);
            } catch (error) {
                console.error("Error fetching project count:", error);
                setCountLoading(false);
            }
        }
        fetchProjectCount();
    }, []);

    // Fetch all projects
    useEffect(() => {
        // console.log("countError", countError);
        async function fetchProjects() {
            if (countLoading) return;

            try {
                setLoading(true);
                const count = Number(projectCount) || 5;
                const projectsArray: Array<Project | null> = [];

                // Create array of projects to fetch
                for (let i = 0; i < count; i++) {
                    projectsArray.push(null); // Initialize with placeholders
                }

                setProjects(projectsArray);

                // Fetch each project
                for (let i = 0; i < count; i++) {
                    try {
                        // Convert string BigInt values to actual BigInt and update the array
                        const serializedProject =
                            await publicClient.readContract({
                                address: FundlAddress as `0x${string}`,
                                abi: FundlABI,
                                functionName: "projects",
                                args: [BigInt(i)],
                            });
                        const project = deserializeProject(
                            serializedProject as SerializedProject
                        );

                        setProjects((prev) => {
                            const updated = [...prev];
                            updated[i] = project;
                            return updated;
                        });
                    } catch (err) {
                        console.error(`Error fetching project ${i}:`, err);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects.");
                setLoading(false);
            }
        }

        fetchProjects();
    }, [projectCount, countLoading]);

    // Calculate pagination
    const totalPages = Math.ceil((projects.length || 0) / projectsPerPage);
    const startIndex = (page - 1) * projectsPerPage;
    const displayedProjects = projects.slice(
        startIndex,
        startIndex + projectsPerPage
    );

    if (loading || countLoading) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-4">
                <Card className="w-full max-w-6xl p-8 mb-8">
                    <h1 className="text-4xl font-extrabold mb-8 text-center">
                        Projects 🚀
                    </h1>

                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border-4 border-black bg-white p-4 h-fit animate-pulse"
                            >
                                <div className="w-full h-64 bg-gray-300 mb-4 border-2 border-black rounded"></div>
                                <div className="h-8 bg-gray-300 w-3/4 mb-2 rounded"></div>
                                <div className="h-4 bg-gray-300 w-full mb-1 rounded"></div>
                                <div className="h-4 bg-gray-300 w-5/6 mb-1 rounded"></div>
                                <div className="h-4 bg-gray-300 w-4/6 mb-4 rounded"></div>
                                <div className="h-8 bg-gray-300 w-full mt-auto rounded"></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-4">
                <Card className="w-full max-w-6xl p-8">
                    <h1 className="text-4xl font-extrabold mb-4 text-center">
                        Error 😕
                    </h1>
                    <p className="text-center text-red-600 font-bold">
                        {error}
                    </p>
                </Card>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-4">
                <Card className="w-full max-w-6xl p-8">
                    <h1 className="text-4xl font-extrabold mb-4 text-center">
                        Projects 🚀
                    </h1>
                    <p className="text-center font-bold">
                        No projects found. Be the first to create one!
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-4">
            <Card className="w-full max-w-6xl p-8 mb-8">
                <h1 className="text-4xl font-extrabold mb-8 text-center">
                    Projects 🚀
                </h1>

                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {displayedProjects.map((project, index) =>
                        project ? (
                            <ProjectCard
                                key={startIndex + index}
                                project={project}
                                id={startIndex + index}
                            />
                        ) : (
                            <div
                                key={startIndex + index}
                                className="rounded-lg border-4 border-black bg-white p-4 h-80 flex items-center justify-center"
                            >
                                <p className="text-center">
                                    Loading project...
                                </p>
                            </div>
                        )
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 gap-4">
                        <Button
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={page === 1}
                            variant="neutral"
                        >
                            Previous
                        </Button>

                        <div className="flex items-center">
                            <span className="font-bold text-lg px-4 py-2 border-4 border-black bg-white">
                                {page} / {totalPages}
                            </span>
                        </div>

                        <Button
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={page === totalPages}
                            variant="neutral"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
