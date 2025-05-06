"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SyllabusCreator } from "./syllabus-creator"
import { courseApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Course description must be at least 10 characters.",
  }),
  subject: z.string({
    required_error: "Please select a subject.",
  }),
  gradeLevel: z.string({
    required_error: "Please select a grade level.",
  }),
})

type CourseDetails = z.infer<typeof formSchema>

interface SyllabusData {
  courseTitle: string
  instructor: string
  term: string
  courseDescription: string
  learningObjectives: string[]
  requiredMaterials: Array<{
    title: string
    author: string
    publisher: string
    year: string
    required: boolean
  }>
  gradingPolicy: {
    assignments: { percentage: number; description: string }
    participation: { percentage: number; description: string }
    midterm: { percentage: number; description: string }
    finalExam: { percentage: number; description: string }
  }
  weeklySchedule: Array<{
    week: number
    topic: string
    readings: string
    assignments: string
  }>
  policies: {
    attendance: string
    lateWork: string
    academicIntegrity: string
    accommodations: string
  }
}

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isCreating, setIsCreating] = useState(false)
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null)

  const form = useForm<CourseDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "",
      gradeLevel: "",
    },
  })

  async function onSubmitDetails(values: CourseDetails) {
    setCourseDetails(values)
    setActiveTab("syllabus")
  }

  async function onCreateCourse(syllabusData: SyllabusData) {
    if (!courseDetails) return

    try {
      setIsCreating(true)
      const course = await courseApi.createCourse({
        name: courseDetails.name,
        description: courseDetails.description,
        subject: courseDetails.subject,
        gradeLevel: courseDetails.gradeLevel,
      })

      // After creating the course, generate the syllabus
      await courseApi.generateSyllabus(course._id, {
        prompt: `Create a comprehensive syllabus for a ${courseDetails.gradeLevel} level ${courseDetails.subject} course titled "${courseDetails.name}". The course is described as: ${courseDetails.description}`,
        additionalInfo: JSON.stringify(syllabusData),
      })
      
      toast({
        title: "Success",
        description: "Course created successfully",
      })
      
      router.push(`/dashboard/courses/${course._id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Create New Course"
        subheading="Set up your course details and create a syllabus with AI assistance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="syllabus" disabled={!courseDetails}>
            Syllabus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Enter the basic details about your course. You'll create your syllabus in the next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitDetails)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to Literature" {...field} />
                        </FormControl>
                        <FormDescription>The name of your course as it will appear to students.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="math">Mathematics</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="history">History</SelectItem>
                              <SelectItem value="art">Art</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="computerScience">Computer Science</SelectItem>
                              <SelectItem value="foreignLanguage">Foreign Language</SelectItem>
                              <SelectItem value="physicalEducation">Physical Education</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gradeLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="elementary">Elementary School</SelectItem>
                              <SelectItem value="middleSchool">Middle School</SelectItem>
                              <SelectItem value="highSchool">High School</SelectItem>
                              <SelectItem value="undergraduate">Undergraduate</SelectItem>
                              <SelectItem value="graduate">Graduate</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of what students will learn in this course..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>This will help our AI generate a more relevant syllabus.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Continue to Syllabus
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="mt-6">
          {courseDetails && (
            <SyllabusCreator courseDetails={courseDetails} onComplete={onCreateCourse} isCreating={isCreating} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
