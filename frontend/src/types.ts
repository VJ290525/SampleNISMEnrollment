export interface Exam { id: number; code: string; name: string; description: string }
export interface Profile { id: number; reference: string; fullName: string; email: string; phone: string; centre: string; status: string; reviewReason: string; createdAt: string; version: string }
export interface Enrollment { id: number; reference: string; profileId: number; profileName: string; examId: number; examName: string; sessionId: number | null; centre: string; status: string; createdAt: string }
export interface Session { id: number; examId: number; examName: string; centre: string; startsAt: string; capacity: number; heldSeats: number; bookedSeats: number; availableSeats: number; bookingOpen: boolean }
export interface DashboardData { exams: Exam[]; profiles: Profile[]; enrollments: Enrollment[]; sessions: Session[] }
export interface CreateExam { code: string; name: string; description: string }
export interface CreateProfile { fullName: string; email: string; phone: string; centre: string }
export interface CreateEnrollment { profileId: number; examId: number; centre: string; sessionId: number | null }
