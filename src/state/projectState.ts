import { Project, ProjectStatus } from '../models/project.js'

// Project State management /* A Redux style implementation */
type Listener<T> = (items: T[]) => void

class State<T> {
  protected listeners: Listener<T>[] = []

  // Adds a supplied callback function to the list of functions listening
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn)
  }
}

export class ProjectState extends State<Project> {
  private projects: Project[] = []
  private static instance: ProjectState // To implement a singleton and make sure there is only ever one instance of state

  private constructor() {
    super()
  }

  // singleton
  static getInstance() {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ProjectState()
    return this.instance
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active)
    this.projects.push(newProject)
    this.updateListeners()
  }

  changeStatus(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(project => project.id === projectId)
    if (project && project.status !== newStatus) {
      project.status = newStatus
      this.updateListeners()
    }
  }

  private updateListeners() {
    // execute each of the functions stored in listeners list
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice())
    }
  }
}

export const projectState = ProjectState.getInstance()
