name: Bug report
description: Create a report to help us improve ZEROTrace AI
title: "[BUG] "
labels: ["bug"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting an issue with ZEROTrace AI! Please provide enough detail so we can reproduce it.
  - type: input
    id: version
    attributes:
      label: Environment / Version
      description: What version of Node, npm, and browser are you using?
      placeholder: "e.g., Node v20.10, Chrome 128, Windows 11"
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      description: A clear and concise description of what happened.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps To Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Login as 'operator@zerotrace.demo'
        2. Go to 'Wipe jobs'
        3. Click on 'Advance simulation'
        4. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What did you expect to happen?
    validations:
      required: true
