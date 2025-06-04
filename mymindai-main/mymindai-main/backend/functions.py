def get_functions():
    
    functions = [
        {
            "type": "function",
            "name": "create_event",
            "strict": True,
            "parameters": {
                "type": "object",
                "required": [
                "reminders"
                ],
                "properties": {
                "reminders": {
                    "type": "array",
                    "items": {
                    "type": "object",
                    "required": [
                        "title",
                        "notify_date",
                        "end_date",
                        "event_type",
                        "recurrence",
                        "start_date",
                        "notify_before"
                    ],
                    "properties": {
                        "title": {
                        "type": "string"
                        },
                        "end_date": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "minLength": 0,
                        "description": "Формат: DD.MM.YYYY HH:MM"
                        },
                        "event_type": {
                        "enum": [
                            "recurring",
                            "single"
                        ],
                        "type": "string",
                        "description": "Тип события: регулярное или однократное"
                        },
                        "recurrence": {
                        "type": [
                            "object",
                            "null"
                        ],
                        "required": [
                            "frequency",
                            "interval"
                        ],
                        "properties": {
                            "interval": {
                            "type": [
                                "integer",
                                "null"
                            ],
                            "description": "Интервал повторения, например, каждые 2 дня"
                            },
                            "frequency": {
                            "enum": [
                                "every_n_minutes",
                                "daily",
                                "weekly",
                                "monthly",
                                "yearly"
                            ],
                            "type": [
                                "string",
                                "null"
                            ],
                            "description": "Регулярность повторения"
                            }
                        },
                        "additionalProperties": False
                        },
                        "start_date": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "minLength": 0,
                        "description": "Формат: DD.MM.YYYY HH:MM"
                        },
                        "notify_date": {
                        "type": "string",
                        "description": "Формат: DD.MM.YYYY HH:MM"
                        },
                        "notify_before": {
                        "type": [
                            "integer",
                            "null"
                        ]
                        }
                    },
                    "additionalProperties": False
                    },
                    "description": "Массив объектов, представляющих напоминания."
                }
                },
                "additionalProperties": False
            },
            "description": "Создает событие в календаре"
        },
        {
            "type": "function",
            "name": "update_event",
            "strict": True,
            "parameters": {
                "type": "object",
                "required": [
                "reminders"
                ],
                "properties": {
                "reminders": {
                    "type": "array",
                    "items": {
                    "type": "object",
                    "required": [
                        "id",
                        "title",
                        "notify_date",
                        "end_date",
                        "event_type",
                        "recurrence",
                        "start_date",
                        "notify_before"
                    ],
                    "properties": {
                        "id": {
                        "type": "integer"
                        },
                        "title": {
                        "type": "string"
                        },
                        "end_date": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "minLength": 0,
                        "description": "Формат: DD.MM.YYYY HH:MM"
                        },
                        "event_type": {
                        "enum": [
                            "recurring",
                            "single"
                        ],
                        "type": "string",
                        "description": "Тип события: регулярное или однократное"
                        },
                        "recurrence": {
                        "type": [
                            "object",
                            "null"
                        ],
                        "required": [
                            "frequency",
                            "interval"
                        ],
                        "properties": {
                            "interval": {
                            "type": [
                                "integer",
                                "null"
                            ],
                            "description": "Интервал повторения, например, каждые 2 дня"
                            },
                            "frequency": {
                            "enum": [
                                "every_n_minutes",
                                "daily",
                                "weekly",
                                "monthly",
                                "yearly"
                            ],
                            "type": [
                                "string",
                                "null"
                            ],
                            "description": "Регулярность повторения"
                            }
                        },
                        "additionalProperties": False
                        },
                        "start_date": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "minLength": 0,
                        "description": "Формат: DD.MM.YYYY HH:MM"
                        },
                        "notify_date": {
                        "type": "string",
                        "description": "Формат: DD.MM.YYYY HH:MM"
                        },
                        "notify_before": {
                        "type": [
                            "integer",
                            "null"
                        ]
                        }
                    },
                    "additionalProperties": False
                    },
                    "description": "Массив объектов, представляющих напоминания."
                }
                },
                "additionalProperties": False
            },
            "description": "Обновляет событие в календаре"
        },
        {
            "type": "function",
            "name": "remove_event",
            "strict": True,
            "parameters": {
                "type": "object",
                "required": [
                "reminders"
                ],
                "properties": {
                "reminders": {
                    "type": "array",
                    "items": {
                    "type": "object",
                    "required": [
                        "id"
                    ],
                    "properties": {
                        "id": {
                        "type": "integer"
                        }
                    },
                    "additionalProperties": False
                    },
                    "description": "Массив объектов, представляющих напоминания."
                }
                },
                "additionalProperties": False
            },
            "description": "Удаляет событие в календаре"
        },
        {
            "type": "function",
            "name": "create_note",
            "description": "Создаёт заметки",
            "parameters": {
                "type": "object",
                "required": [
                "notes"
                ],
                "additionalProperties": False,
                "properties": {
                "notes": {
                    "type": "array",
                    "description": "Массив объектов, представляющих заметки.",
                    "items": {
                    "type": "object",
                    "required": [
                        "title",
                        "content"
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "title": {
                        "type": [
                            "string",
                            "null"
                        ]
                        },
                        "content": {
                        "type": [
                            "string",
                            "null"
                        ]
                        }
                    }
                    }
                }
                }
            },
            "strict": True
        },
        {
            "type": "function",
            "name": "update_note",
            "description": "Обновляет заметки",
            "parameters": {
                "type": "object",
                "required": [
                "notes"
                ],
                "additionalProperties": False,
                "properties": {
                "notes": {
                    "type": "array",
                    "description": "Массив объектов, представляющих заметки.",
                    "items": {
                    "type": "object",
                    "required": [
                        "id",
                        "title",
                        "content"
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "id": {
                        "type": [
                            "integer"
                        ]
                        },
                        "title": {
                        "type": [
                            "string",
                            "null"
                        ]
                        },
                        "content": {
                        "type": [
                            "string",
                            "null"
                        ]
                        }
                    }
                    }
                }
                }
            },
            "strict": True
        },
        {
            "type": "function",
            "name": "remove_note",
            "description": "Удаляет заметки",
            "parameters": {
                "type": "object",
                "required": [
                "notes"
                ],
                "additionalProperties": False,
                "properties": {
                "notes": {
                    "type": "array",
                    "description": "Массив объектов, представляющих заметки.",
                    "items": {
                    "type": "object",
                    "required": [
                        "id"
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "id": {
                        "type": [
                            "integer"
                        ]
                        }
                    }
                    }
                }
                }
            },
            "strict": True
        },
        {
            "type": "function",
            "name": "create_task",
            "description": "Создаёт задачу",
            "parameters": {
                "type": "object",
                "required": [
                "tasks"
                ],
                "additionalProperties": False,
                "properties": {
                "tasks": {
                    "type": "array",
                    "description": "Массив объектов, представляющих задачи.",
                    "items": {
                    "type": "object",
                    "required": [
                        "title",
                        "content"
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "title": {
                        "type": [
                            "string",
                            "null"
                        ]
                        },
                        "content": {
                        "type": [
                            "string",
                            "null"
                        ]
                        }
                    }
                    }
                }
                }
            },
            "strict": True
        },
        {
            "type": "function",
            "name": "update_task",
            "description": "Обновляет задачу",
            "parameters": {
                "type": "object",
                "required": [
                "tasks"
                ],
                "additionalProperties": False,
                "properties": {
                "tasks": {
                    "type": "array",
                    "description": "Массив объектов, представляющих задачи.",
                    "items": {
                    "type": "object",
                    "required": [
                        "title",
                        "content",
                        "id"
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "id": {
                        "type": [
                            "integer"
                        ]
                        },
                        "title": {
                        "type": [
                            "string",
                            "null"
                        ]
                        },
                        "content": {
                        "type": [
                            "string",
                            "null"
                        ]
                        }
                    }
                    }
                }
                }
            },
            "strict": True
        },
        {
            "type": "function",
            "name": "remove_task",
            "description": "Удаляет задачу",
            "parameters": {
                "type": "object",
                "required": [
                "tasks"
                ],
                "additionalProperties": False,
                "properties": {
                "tasks": {
                    "type": "array",
                    "description": "Массив объектов, представляющих задачи.",
                    "items": {
                    "type": "object",
                    "required": [
                        "id"
                    ],
                    "additionalProperties": False,
                    "properties": {
                        "id": {
                        "type": [
                            "integer"
                        ]
                        }
                    }
                    }
                }
                }
            },
            "strict": True
        },
        {
            "type": "file_search",
            "vector_store_ids": [
                "vs_682f8a2e201481918a70f33130c3d40b"
            ]
        },
        {
            "type": "web_search_preview",
            "user_location": {
                "type": "approximate",
                "country": "RU"
            },
            "search_context_size": "medium"
        }
    ]
    return functions