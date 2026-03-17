# My Package

## Architecture

### Package Overview

<!-- UML:packages:START -->
```mermaid
classDiagram
  direction TB
  class animals["animals"] {
    Animal
    Mammal
  }
  class domestic["domestic"] {
    Dog
    Cat
  }
  class wild["wild"] {
    Wolf
    Lion
  }

  animals --> domestic
  animals --> wild

  click animals href "#animals"
  click domestic href "#domestic"
  click wild href "#wild"
```
<!-- UML:packages:END -->

### animals

<!-- UML:animals:START -->
```mermaid
classDiagram
  direction TB
  class Animal {
    <<interface>>
    +name: string
    +speak() void
  }
  class Mammal {
    +warmBlooded: boolean
    +breathe() void
  }
  Animal <|.. Mammal
```
<!-- UML:animals:END -->

### domestic

<!-- UML:domestic:START -->
```mermaid
classDiagram
  direction TB
  class Dog {
    +breed: string
    +fetch() void
  }
  class Cat {
    +indoor: boolean
    +purr() void
  }
  Mammal <|-- Dog
  Mammal <|-- Cat
```
<!-- UML:domestic:END -->

### wild

<!-- UML:wild:START -->
```mermaid
classDiagram
  direction TB
  class Wolf {
    +packSize: number
    +howl() void
  }
  class Lion {
    +maneColor: string
    +roar() void
  }
  Mammal <|-- Wolf
  Mammal <|-- Lion
```
<!-- UML:wild:END -->