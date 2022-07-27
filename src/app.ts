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

// Project State management /* A Redux type implementation */
type Listener = (items: Project[]) => void

class ProjectState {
  private listeners: Listener[] = []
  private projects: Project[] = []
  private static instance: ProjectState // To implement a singleton and make sure there is only ever one instance of state

  private constructor() {}

  // singleton
  static getInstance() {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ProjectState()
    return this.instance
  }

  // Adds a supplied callback function to the list of functions listening
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn)
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

const state = ProjectState.getInstance()

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

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLElement
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement // or <HTMLTemplateElement>document.getElementById('project-input')!
    this.hostElement = document.getElementById('app')! as HTMLDivElement
    this.assignedProjects = []

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLElement
    this.element.id = `${this.type}-projects`

    state.addListener((projects: Project[]) => {
      this.assignedProjects = projects
      this.renderProjects()
    })

    this.attach()
    this.renderContent()
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-lists`)! as HTMLUListElement
    for (const project of this.assignedProjects) {
      const item = document.createElement('li')
      item.textContent = project.title
      listEl.appendChild(item)
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-lists`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element)
  }
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLFormElement
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement // or <HTMLTemplateElement>document.getElementById('project-input')!
    this.hostElement = document.getElementById('app')! as HTMLDivElement

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLFormElement
    this.element.id = 'user-input'
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement
    this.configure()
    this.attach()
  }

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
      state.addProject(title, description, people)
      this.clearInputs()
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const projectInput = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
