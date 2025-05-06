"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { courseApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseApi.getCourses()
        setCourses(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [toast])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <PageHeader heading="Courses" subheading="Manage your courses and create new ones" />
          <Button asChild>
            <Link href="/dashboard/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader heading="Courses" subheading="Manage your courses and create new ones" />
        <Button asChild>
          <Link href="/dashboard/courses/create" title="Create a new course with details and AI-generated syllabus">
            <Plus className="mr-2 h-4 w-4" />
            Create New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">Create your first course to get started</p>
          <Button asChild>
            <Link href="/dashboard/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id}>
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{course.students || 0}</span> Students
                  </div>
                  <div>
                    <span className="font-medium">{course.assignments?.length || 0}</span> Assignments
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/courses/${course._id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
