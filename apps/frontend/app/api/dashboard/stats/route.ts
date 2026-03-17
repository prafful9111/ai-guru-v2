import { prisma } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Total users (role: STAFF)
        const totalUsers = await prisma.user.count({
            where: { role: 'STAFF' }
        });

        // 2. Total assessments completed
        const totalAssessments = await prisma.assessmentSession.count({
            where: { status: 'completed' }
        });

        // 3. Unique users who gave the assessment (only completed ones)
        const uniqueUsersList = await prisma.assessmentSession.findMany({
            where: { status: 'completed' },
            select: { userId: true },
            distinct: ['userId']
        });
        const uniqueUsers = uniqueUsersList.length;

        // 4. Pass/Fail counts
        const sessions = await prisma.assessmentSession.findMany({
            where: { status: 'completed' },
            select: { assessmentScores: true }
        });

        let passCount = 0;
        let failCount = 0;

        sessions.forEach((session: any) => {
            const scores = session.assessmentScores as any;
            if (scores?.pass_fail === 'Pass') {
                passCount++;
            } else if (scores?.pass_fail === 'Fail') {
                failCount++;
            }
        });

        return NextResponse.json({
            totalUsers,
            totalAssessments,
            uniqueUsers,
            passFail: {
                pass: passCount,
                fail: failCount
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
