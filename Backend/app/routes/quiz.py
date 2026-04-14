from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from bson import ObjectId
from ..models import QuizSubmissionModel, QuizStepModel
from ..database import get_database

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/submit", response_description="Submit a new skin consultation", response_model=QuizSubmissionModel, status_code=status.HTTP_201_CREATED)
async def submit_quiz(submission: QuizSubmissionModel = Body(...)):
    db = await get_database()
    # Insert as alias fields but exclude actual id to let Mongo generate _id
    new_submission = await db["quiz_submissions"].insert_one(submission.model_dump(by_alias=True, exclude=["id"]))
    created_submission = await db["quiz_submissions"].find_one({"_id": new_submission.inserted_id})
    return created_submission

@router.get("/submissions", response_description="List all consultation submissions", response_model=List[QuizSubmissionModel])
async def list_submissions():
    db = await get_database()
    submissions = await db["quiz_submissions"].find().sort("createdAt", -1).to_list(1000)
    return submissions

@router.delete("/submissions/{id}", response_description="Delete a submission")
async def delete_submission(id: str):
    db = await get_database()
    delete_result = await db["quiz_submissions"].delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"message": "Submission deleted successfully"}
    raise HTTPException(status_code=404, detail=f"Submission {id} not found")

@router.get("/steps", response_description="List all quiz steps", response_model=List[QuizStepModel])
async def list_quiz_steps():
    db = await get_database()
    steps = await db["quiz_steps"].find().sort("order", 1).to_list(100)
    return steps

@router.post("/steps", response_description="Create a new quiz step", response_model=QuizStepModel, status_code=status.HTTP_201_CREATED)
async def create_quiz_step(step: QuizStepModel = Body(...)):
    db = await get_database()
    new_step = await db["quiz_steps"].insert_one(step.model_dump(by_alias=True, exclude=["id"]))
    created_step = await db["quiz_steps"].find_one({"_id": new_step.inserted_id})
    return created_step

@router.put("/steps/{id}", response_description="Update a quiz step", response_model=QuizStepModel)
async def update_quiz_step(id: str, step: QuizStepModel = Body(...)):
    db = await get_database()
    update_data = step.model_dump(by_alias=True, exclude=["id"])
    result = await db["quiz_steps"].update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if result.matched_count == 1:
        updated_step = await db["quiz_steps"].find_one({"_id": ObjectId(id)})
        return updated_step
    raise HTTPException(status_code=404, detail=f"Step {id} not found")

@router.delete("/steps/{id}", response_description="Delete a quiz step")
async def delete_quiz_step(id: str):
    db = await get_database()
    delete_result = await db["quiz_steps"].delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"message": "Step deleted successfully"}
    raise HTTPException(status_code=404, detail=f"Step {id} not found")
