<?php 
namespace App\Services; 
use App\Repositories\UserRepository;
use App\Helpers\Hash;
use App\Helpers\JWT;

class AuthServices 
{
    private UserRepository $userRepo;
    private array $config;
    public function __construct(UserRepository $userRepo, array $config)
    {
        $this->userRepo = $userRepo;
        $this->config= $config;

    }
    public function register(array $data ): array 
    
    {
        if($this->userRepo->emailExists($data['email'])){
            return ['errol'=>"Email đã tồn tại"];
        }
        $userData=[
            'uuid'=>\App\Helpers\Uuid::generate(),
            'email'=> $data['email'],
            'password'=>Hash::make($data['password']),
            "full_name"=>$data['full_name'],
            'phone'=>$data['phone']?? null,
            'role'=>'user',
            'status'=>'active',
        ];
        $user = $this -> userRepo->create($userData);
        $token = $this->generateTokens($user->id);
        return [ 
            'user'=>$user->toArray(),
            'token'=>$token,

        ];


    }
    public function login(string $email, string $password,string $ip): array

}
?>