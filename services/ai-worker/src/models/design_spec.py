"""
DesignSpec Pydantic modelleri — DESIGN_SPEC.md v1 sözleşmesinden türetilmiştir.
Şema değişikliklerinde bu dosya ve packages/design-spec/src/schema.ts birlikte güncellenir.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class LayoutMode(str, Enum):
    COLUMN = "column"
    ROW = "row"
    STACK = "stack"
    GRID = "grid"
    ABSOLUTE = "absolute"
    SCROLL = "scroll"


class ActionType(str, Enum):
    NAVIGATE = "navigate"
    BACK = "back"
    OPEN_MODAL = "openModal"
    CLOSE_MODAL = "closeModal"
    SET_LOCAL_STATE = "setLocalState"
    SUBMIT_FORM = "submitForm"
    OPEN_URL = "openUrl"


class A11y(BaseModel):
    role: str
    label: str
    hint: str | None = None
    state: dict[str, Any] | None = None
    order: int | None = None


class Layout(BaseModel):
    mode: LayoutMode
    gap: str | None = None
    padding: str | None = None
    wrap: bool | None = None


class Action(BaseModel):
    type: ActionType
    target_screen_id: str | None = Field(None, alias="targetScreenId")
    params: dict[str, Any] | None = None


class Interaction(BaseModel):
    event: str
    action: Action


class DesignNode(BaseModel):
    id: str
    type: str
    props: dict[str, Any] = Field(default_factory=dict)
    layout: Layout | None = None
    children: list[DesignNode] | None = None
    interactions: list[Interaction] | None = None
    a11y: A11y | None = None
    visibility: bool | str | None = None
    bindings: dict[str, Any] | None = None


class Screen(BaseModel):
    id: str
    name: str
    route: str | None = None
    root: DesignNode


class Flow(BaseModel):
    from_screen: str = Field(alias="from")
    to_screen: str = Field(alias="to")
    trigger: str

    model_config = {"populate_by_name": True}


class DesignSpec(BaseModel):
    schema_version: str = Field("1.0.0", alias="schemaVersion")
    project_id: str = Field(alias="projectId")
    platform: str
    locale: str
    device_profile: str = Field(alias="deviceProfile")
    tokens: dict[str, Any] = Field(default_factory=dict)
    assets: list[Any] = Field(default_factory=list)
    components: dict[str, Any] = Field(default_factory=dict)
    screens: list[Screen] = Field(default_factory=list)
    flows: list[Flow] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class PatchOperation(BaseModel):
    op: str
    node_id: str | None = Field(None, alias="nodeId")
    value: Any = None


class DesignSpecPatch(BaseModel):
    base_revision: int = Field(alias="baseRevision")
    operations: list[PatchOperation]

    model_config = {"populate_by_name": True}
