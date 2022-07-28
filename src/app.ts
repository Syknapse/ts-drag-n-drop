// Project type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State management /* A Redux style implementation */
type Listener<T> = (items: T[]) => void

class State<T> {
  protected listeners: Listener<T>[] = []

  // Adds a supplied callback function to the list of functions listening
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn)
  }
}

class ProjectState extends State<Project> {
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
    // execute each of the functions stored in listeners list
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice())
    }
  }
}

const projectState = ProjectState.getInstance()

// Validation
interface Validatable {
  value: string | number
  isRequired?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

function validate(validatableInput: Validatable) {
  let isValid = true

  if (validatableInput.isRequired) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }

  return isValid
}

// AutoBind decorator
function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this)
      return boundFn
    },
  }
  return adjustedDescriptor
}

// Base component class (abstract, can only be extended and not instantiated)
abstract class Base<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement
  hostElement: T
  element: U

  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement // or <HTMLTemplateElement>document.getElementById('project-input')!
    this.hostElement = document.getElementById(hostElementId)! as T

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as U
    if (newElementId) this.element.id = newElementId

    this.attach(insertAtStart)
  }

  private attach(_insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(_insertAtStart ? 'afterbegin' : 'beforeend', this.element)
  }

  // Force classes that extend this to define these methods
  abstract configure(): void
  abstract renderContent(): void
}

// ProjectItem class
class ProjectItem extends Base<HTMLUListElement, HTMLLIElement> {
  private project: Project

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id)
    this.project = project

    this.configure()
    this.renderContent()
  }

  configure() {}
  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title
    this.element.querySelector('h3')!.textContent = this.project.people.toString()
    this.element.querySelector('p')!.textContent = this.project.description
  }
}

// ProjectList Class
class ProjectList extends Base<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`)
    this.assignedProjects = []

    this.configure()
    this.renderContent()
  }

  configure() {
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

// ProjectInput Class
class ProjectInput extends Base<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    super('project-input', 'app', true, 'user-input')
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

    this.configure()
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  renderContent() {}

  private handleUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value
    const description = this.descriptionInputElement.value
    const people = this.peopleInputElement.value

    const titleValidatable: Validatable = {
      value: title,
      isRequired: true,
    }
    const descriptionValidatable: Validatable = {
      value: description,
      isRequired: true,
      minLength: 5,
    }
    const peopleValidatable: Validatable = {
      value: parseFloat(people),
      isRequired: true,
      min: 1,
      max: 5,
    }

    if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
      alert(`Invalid input=> {title: ${title}, description: ${description}, people: ${people}}`)
      return
    } else {
      return [title, description, parseFloat(people)]
    }
  }

  private clearInputs() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault()
    const userInput = this.handleUserInput()
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput
      projectState.addProject(title, description, people)
      this.clearInputs()
    }
  }
}

const projectInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
