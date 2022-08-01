import { projectState } from '../state/projectState'
import { autoBind } from '../decorators/autobind'
import { DragTarget } from '../models/dragDrop'
import { Project, ProjectStatus } from '../models/project'
import { Base } from './base'
import { ProjectItem } from './projectItem'

export class ProjectList extends Base<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`)
    this.assignedProjects = []

    this.configure()
    this.renderContent()
  }

  @autoBind
  dragOverHandler(event: DragEvent) {
    // Check that the dragged item is of the type we are expecting
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // The default is to not allow a drop. We need this for the 'drop' event to fire
      event.preventDefault()
      const listEl = this.element.querySelector('ul')!
      listEl.classList.add('droppable')
    }
  }

  @autoBind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain')
    projectState.changeStatus(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
  }

  @autoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!
    listEl.classList.remove('droppable')
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('drop', this.dropHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
    projectState.addListener((projects: Project[]) => {
      const filteredProjects = projects.filter(project => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active
        }
        return project.status === ProjectStatus.Finished
      })
      this.assignedProjects = filteredProjects
      this.renderProjects()
    })
  }

  renderContent() {
    const listId = `${this.type}-projects-lists`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-lists`)! as HTMLUListElement
    listEl.innerHTML = ''
    for (const project of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, project)
    }
  }
}
