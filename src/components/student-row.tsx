import Link from "next/link";
import { Student } from "@/lib/types";

type StudentRowProps = {
    student: Student;
};

export function StudentRow({ student }: StudentRowProps) {
    return (
        <tr key={student.id} className="hover:bg-slate-50">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">
                        {student.avatar}
                    </span>

                    <div>
                        <p className="font-semibold">{student.name}</p>

                        <p className="text-sm text-slate-500">
                            {student.email}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4 text-sm">
                {student.language} · {student.level}
            </td>

            <td className="px-5 py-4 text-sm text-slate-500">
                {student.timezone}
            </td>

            <td className="px-5 py-4">
                <span
                    className={
                        student.balance
                            ? "font-semibold text-amber-700"
                            : "font-semibold text-emerald-700"
                    }
                >
                    {student.balance ? `$${student.balance}` : "Paid"}
                </span>
            </td>

            <td className="px-5 py-4 text-right">
                <Link
                    href={`/dashboard/students/${student.id}`}
                    className="text-sm font-semibold text-blue-800 hover:underline"
                >
                    Open
                </Link>
            </td>
        </tr>
    );
}