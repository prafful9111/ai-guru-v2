import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const useScenarios = () => {
    return useQuery({
        queryKey: ["scenarios"],
        queryFn: async () => {
            const data = await apiClient.get<any[]>("/api/scenarios");
            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                difficulty: item.difficulty,
                type: item.type,
                is_active: item.isActive,
                departments: item.departments,
                roleplay_prompt: item.roleplayPrompt,
                examiner_prompt: item.examinerPrompt,
                roleplay_eval_prompt: item.roleplayEvalPrompt,
                examiner_eval_prompt: item.examinerEvalPrompt,
            }));
        },
    });
};
