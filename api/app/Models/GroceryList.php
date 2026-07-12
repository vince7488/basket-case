<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class GroceryList extends Model
{
    // HasUuids tells Eloquent to generate string UUID primary keys instead of numeric IDs.
    use HasUuids;

    // UUID primary keys are strings and are not database auto-increment integers.
    public $incrementing = false;

    protected $keyType = 'string';

    // $fillable limits which request fields can be mass-assigned into the model.
    protected $fillable = [
        'name',
        'budget',
        'items',
    ];

    protected function casts(): array
    {
        return [
            // Decimal casts keep budget values normalized to two currency places.
            'budget' => 'decimal:2',
            // Array casts let Laravel read and write the JSON item payload naturally.
            'items' => 'array',
        ];
    }
}
