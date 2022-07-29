// Base component class (abstract, can only be extended and not instantiated)
export abstract class Base<T extends HTMLElement, U extends HTMLElement> {
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
