<?php

namespace App\Http\Controllers\excel_upload;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Validator;

use App\Models\User;
use App\Models\Dataset;
use App\Models\BusinessData;
use App\Models\TempBusinessDataSample;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        try{
            
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:xlsx,xls',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 400);
            }

            $file = $request->file('file');
            $user = $request->user();

            $hash = md5_file($file->getRealPath());

            $existingDataset = Dataset::where('user_id', $user->id)
                ->where('file_hash', $hash)
                ->first();

            if ($existingDataset) {

                // delete old business data 
                BusinessData::where('dataset_id', $existingDataset->id)->delete();

                // delete old business data in temp_business_data table
                TempBusinessDataSample::where('dataset_id', $existingDataset->id)->delete();


                // update dataset status
                $existingDataset->status = 'processing';
                $existingDataset->error_message = null;
                $existingDataset->save();

                $dataset = $existingDataset;
            }
            else {

                // insert into datasets table
                $dataset = new Dataset();
                $dataset->user_id = $user->id;
                $dataset->file_name = $file->getClientOriginalName();
                $dataset->status = 'processing';
                $dataset->file_hash = $hash;
                $dataset->save();

            }

            // send file to python server
            $response = Http::attach(
                'file', 
                file_get_contents($file->getRealPath()), 
                $file->getClientOriginalName()
            )->post('http://127.0.0.1:8001/upload', [
                'user_id' => $user->id,
                'dataset_id' => $dataset->id,
            ]);

            // handle response from python server after processing file
            if ($response->successful()) {
                $dataset->status = 'Start Review';
                $dataset->save();
                return response()->json([
                    'message' => 'File uploaded and processed successfully',
                    'dataset_id' => $dataset->id,
                    'rows_inserted' => $response->json('rows_inserted'),
                    "columns_detected" => $response->json('columns_detected'),
                    "column_mapping" => $response->json('column_mapping'),
                    'confidence_scores' => $response->json('confidence_scores')
                ], 200);
            } else {
                $dataset->status = 'failed';
                $dataset->save();
                return response()->json(['error' => 'Failed to process file'], 500);
            }


        } catch(\Exception $e){
            if (isset($dataset)) {
                $dataset->status = 'failed';
                $dataset->error_message = $e->getMessage();
                $dataset->save();
            }
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmUpload(Request $request)
    {
        try {
            $response = Http::post('http://127.0.0.1:8001/confirm_upload', [
            'dataset_id' => $request->dataset_id,
            ]);

            // if reponse is successful, fetch data from business_data table and return to frontend
            if ($response->successful()) {
                // $datasetId = $response->json('dataset_id');

                return response()->json([
                    'dataset_id' => $response->json('dataset_id'),
                    'message' => 'Please review the data and confirm if it is correct.'
                ], 200);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {

            return response()->json([
                'error' => $e->getMessage()
            ], 500);

        }
    }
}
