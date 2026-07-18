<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inovector\Mixpost\Enums\PostStatus;
use Inovector\Mixpost\Models\Account;
use Inovector\Mixpost\Models\Post;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

if (getenv('DIGITALHUT_CONTROL_STATUS')) {
    echo json_encode(['paused' => (bool) cache()->get('digitalhut.autopublisher.paused', false)]).PHP_EOL;
    exit(0);
}

$controlSet = trim((string) getenv('DIGITALHUT_CONTROL_SET'));
if (in_array($controlSet, ['paused', 'active'], true)) {
    $paused = $controlSet === 'paused';
    cache()->forever('digitalhut.autopublisher.paused', $paused);
    echo json_encode(['ok' => true, 'paused' => $paused]).PHP_EOL;
    exit(0);
}

$releaseNowUuid = trim((string) getenv('DIGITALHUT_RELEASE_NOW_UUID'));
if ($releaseNowUuid !== '') {
    $releasePost = Post::query()->where('uuid', $releaseNowUuid)->firstOrFail();
    $releasePost->setScheduled(Carbon::now('UTC')->subMinute());
    echo json_encode(['ok' => true, 'uuid' => $releasePost->uuid, 'due' => true]).PHP_EOL;
    exit(0);
}

$statusUuid = trim((string) getenv('DIGITALHUT_STATUS_UUID'));
if ($statusUuid !== '') {
    $statusPost = Post::query()->where('uuid', $statusUuid)->firstOrFail();
    echo json_encode([
        'uuid' => $statusPost->uuid,
        'status' => $statusPost->status->name,
        'scheduled_at' => $statusPost->scheduled_at?->toIso8601String(),
        'published_at' => $statusPost->published_at?->toIso8601String(),
        'accounts' => $statusPost->accounts()->get()->map(fn ($account) => [
            'provider' => $account->provider,
            'provider_post_id' => $account->pivot->provider_post_id,
            'errors' => $account->pivot->errors,
        ])->all(),
    ], JSON_UNESCAPED_SLASHES).PHP_EOL;
    exit(0);
}

$body = trim((string) getenv('DIGITALHUT_POST_BODY'));
$evidence = trim((string) getenv('DIGITALHUT_EVIDENCE_ID'));
$delayMinutes = max(2, min(60, (int) (getenv('DIGITALHUT_SCHEDULE_DELAY_MINUTES') ?: 5)));

if ($body === '' || mb_strlen($body) > 500) {
    fwrite(STDERR, "invalid-body\n");
    exit(2);
}

$account = Account::query()->oldest()->first();
if (!$account) {
    fwrite(STDERR, "no-connected-account\n");
    exit(3);
}

$duplicate = Post::query()->whereHas('versions', function ($query) use ($evidence) {
    $query->where('content', 'like', '%'.addcslashes($evidence, '%_').'%' );
})->exists();
if ($evidence === '' || $duplicate) {
    fwrite(STDERR, $duplicate ? "duplicate\n" : "missing-evidence\n");
    exit($duplicate ? 10 : 4);
}

$post = DB::transaction(function () use ($account, $body, $evidence, $delayMinutes) {
    $post = Post::create([
        'status' => PostStatus::SCHEDULED,
        'scheduled_at' => Carbon::now('UTC')->addMinutes($delayMinutes),
    ]);
    $post->accounts()->attach($account->id);
    $post->versions()->create([
        'account_id' => 0,
        'is_original' => true,
        'content' => [[
            'body' => $body."\n\nEvidence: ".$evidence,
            'media' => [],
        ]],
    ]);
    return $post;
});

echo json_encode([
    'ok' => true,
    'uuid' => $post->uuid,
    'scheduled_at' => $post->scheduled_at?->toIso8601String(),
    'evidence' => $evidence,
], JSON_UNESCAPED_SLASHES).PHP_EOL;
