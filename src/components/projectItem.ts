import { projectState } from '../state/projectState'
import { autoBind } from '../decorators/autobind'
import { Draggable } from '../models/dragDrop'
import { Project } from '../models/project'
import { Base } from './base'

export class ProjectItem extends Base<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project

  get persons() {
    if (this.project.people === 1) {
      return '1 person assigned'
    } else {
      return `${this.project.people} individuals assigned`
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id)
    this.project = project

    this.configure()
    this.renderContent()
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id)
    event.dataTransfer!.effectAllowed = 'move'
  }

  dragEndHandler(_: DragEvent) {}

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
    this.element.querySelector('button')!.addEventListener('click', () => projectState.deleteProject(this.element.id))
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title
    this.element.querySelector('h3')!.textContent = this.persons
    this.element.querySelector('p')!.textContent = this.project.description
  }
}
