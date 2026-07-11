<?php

namespace Tests\Feature;

use App\Models\GroceryList;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroceryListApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_grocery_list_with_a_uuid(): void
    {
        $response = $this->postJson('/api/lists', $this->validPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Saturday groceries')
            ->assertJsonPath('data.budget', '100.00')
            ->assertJsonPath('data.items.0.name', 'Milk');

        $this->assertDatabaseHas('grocery_lists', [
            'id' => $response->json('data.id'),
            'name' => 'Saturday groceries',
        ]);
    }

    public function test_it_returns_a_saved_grocery_list(): void
    {
        $list = GroceryList::create($this->validPayload(['name' => 'Reloaded list']));

        $response = $this->getJson("/api/lists/{$list->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $list->id)
            ->assertJsonPath('data.name', 'Reloaded list')
            ->assertJsonPath('data.items.0.quantity', 2);
    }

    public function test_it_updates_a_saved_grocery_list(): void
    {
        $list = GroceryList::create($this->validPayload());

        $response = $this->putJson("/api/lists/{$list->id}", $this->validPayload([
            'name' => 'Updated groceries',
            'budget' => 80,
            'items' => [
                [
                    'id' => '63c2cc03-89da-49a9-a4e1-b55be7cd51ae',
                    'name' => 'Milk',
                    'price' => 4.99,
                    'quantity' => 3,
                ],
            ],
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated groceries')
            ->assertJsonPath('data.budget', '80.00')
            ->assertJsonPath('data.items.0.quantity', 3);

        $this->assertDatabaseHas('grocery_lists', [
            'id' => $list->id,
            'name' => 'Updated groceries',
        ]);
    }

    public function test_it_validates_invalid_list_data(): void
    {
        $response = $this->postJson('/api/lists', [
            'name' => '',
            'budget' => -1,
            'items' => [
                [
                    'id' => 'not-a-uuid',
                    'name' => '',
                    'price' => -0.01,
                    'quantity' => 0,
                ],
            ],
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'budget',
                'items.0.id',
                'items.0.name',
                'items.0.price',
                'items.0.quantity',
            ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Saturday groceries',
            'budget' => 100,
            'items' => [
                [
                    'id' => '63c2cc03-89da-49a9-a4e1-b55be7cd51ae',
                    'name' => 'Milk',
                    'price' => 4.99,
                    'quantity' => 2,
                ],
            ],
        ], $overrides);
    }
}
