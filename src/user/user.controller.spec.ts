import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.enum';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';


//Mock data array
const users: any = [
  {
    id: 1,
    name: 'Yumi',
    surname: 'Namie',
    wallet: 1000,
    password: 'password1234',
    email: 'yumi@example.com',
    bio: 'I am Yumi',
    created_at: new Date(2023, 7, 16),
    updated_at: new Date(2023, 7, 16),
  },
  {
    id: 2,
    name: 'John',
    surname: 'Toye',
    wallet: 1000,
    password: 'password5678',
    email: 'john@example.com',
    bio: 'I am John',
    created_at: new Date(2023, 7, 17),
    updated_at: new Date(2023, 7, 17),
  },
];

describe('UserController', () => {
  let controller: UserController;

  //mock for UserService

  const mockUserService = {
    createUser: jest.fn().mockImplementation((createUserDto: CreateUserDto) => {
      const newUser = {
        id: 2,
        ...createUserDto,
      };
      users.push(newUser);
      return Promise.resolve(newUser);
    }),
    
    getUser: jest.fn()/* .mockImplementation(() => Promise.resolve({ users })) */,
    getUserById: jest.fn().mockImplementation((id: number) => {
      const user = users.find((user) => user.id === id);
      return Promise.resolve(user);
    }),

    updateUser: jest
      .fn()
      .mockImplementation((id: number, updateUserDto: UpdateUserDto) => {
        const updatedUser = {
          id,
          ...updateUserDto,
        };
        return Promise.resolve(updatedUser);
      }),

    removeUser: jest
    .fn()
    /*.mockImplementation() ((id: number) => {
      const index = users.findIndex((user) => user.id === id);
      if (index !== -1) {
      const removedUser = users.splice(index, 1)[0];
      return Promise.resolve(removedUser);
    } else {
      return Promise.resolve(null)
    }
  }) */
    
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* it('should create a new user and return the user', async () => {
    const newUser = {
      id: 2,
      name: 'Diego',
      surname: 'Monsalve',
      wallet: 1000,
      password: 'password1234',
      email: 'diego@example.com',
      bio: 'I am Future Diegooo',
      created_at: new Date(2023 - 6 - 16),
      updated_at: new Date(2023 - 6 - 16)
    };

    expect(await controller.create(newUser)).toMatchObject({
      id: expect.any(Number),
    }); */
/*   }); */
/* 
  it('should return a list of all users', async () => {
    expect(await controller.findAll()).toMatchObject({ users });
  }); */
  it('should return a list of all users when an admin user tries to access all users', async () => {
    // Mock the request object with an admin user
    const req = { user: { role: Role.ADMIN } };

    // Define the expected users list
    const expectedUsersList = { users };

    // Mock the userService.getUser method to return the users list
    mockUserService.getUser.mockResolvedValueOnce(expectedUsersList);

    // Call the controller method to get all users
    const usersList = await controller.findAll(req);

    // Expect the response to match the expected users list
    expect(usersList).toMatchObject(expectedUsersList);
  });

  it('should throw UnauthorizedException when a non-admin user tries to access all users', async () => {
    const req = { user: { role: Role.USER, id: 1 } };

    try {
      // Call the controller method to get all users
      await controller.findAll(req);
  
      // If the code reaches this point, it means the exception was not thrown
      throw new Error('Expected UnauthorizedException to be thrown');
    } catch (error) {
      // Assert that the caught error is an instance of UnauthorizedException
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });
/*   it('should retrieve user by id and return the user with that id', async () => {
    const userId = 1;
    const expectedUser = {
      id: 1,
      name: 'Yumi',
      surname: 'Namie',
      wallet: 1000,
      password: 'password1234',
      email: 'yumi@example.com',
      bio: 'I am Yumi',
      created_at: new Date(2023, 7, 16),
      updated_at: expect.any(Date),
    };
    expect(await controller.findOne(userId)).toMatchObject(expectedUser);
  }); */
  it('should retrieve user by ID when the logged-in user matches the ID and return the user', async () => {
    const userId = 1;
    const req = { user: { role: Role.USER, id: userId } };
    const foundUser = await controller.findOne(userId, req);
    const expectedUser = {
      id: 1,
      name: 'Yumi',
      surname: 'Namie',
      wallet: 1000,
      password: 'password1234',
      email: 'yumi@example.com',
      bio: 'I am Yumi',
      created_at: new Date(2023, 7, 16),
      updated_at: expect.any(Date),
    };
    expect(foundUser).toMatchObject(expectedUser);
  });

  it('should retrieve user by ID when an admin user is logged in and return the user', async () => {
    const userId = 1;
    const req = { user: { role: Role.ADMIN } };
    const foundUser = await controller.findOne(userId, req);
    const expectedUser = {
      id: 1,
      name: 'Yumi',
      surname: 'Namie',
      wallet: 1000,
      password: 'password1234',
      email: 'yumi@example.com',
      bio: 'I am Yumi',
      created_at: new Date(2023, 7, 16),
      updated_at: expect.any(Date),
    };
    expect(foundUser).toMatchObject(expectedUser);
  });

  /* it('should update the user bio and password', async () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      password: 'newpassword',
      bio: 'Updated bio',
    };
    const updatedUser = await controller.update(userId, updateUserDto);

    expect(updatedUser).toMatchObject({
      password: expect.any(String),
      bio: 'Updated bio',
    });
  });
 */

  it('should allow a user to update their own profile', async () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      password: 'newpassword',
      bio: 'Updated bio',
    };
    const req = { user: { role: Role.USER, id: userId } };
  
    const updatedUser = await controller.update(userId, updateUserDto, req);
  
    expect(updatedUser).toMatchObject({
      password: expect.any(String),
      bio: 'Updated bio',
    });
  });

  it('should allow an admin to update any user\'s profile', async () => {
    const userId = 2; // ID of the user to be updated
    const updateUserDto: UpdateUserDto = {
      password: 'newpassword',
      bio: 'Updated bio',
    };
    const req = { user: { role: Role.ADMIN } };
  
    const updatedUser = await controller.update(userId, updateUserDto, req);
  
    expect(updatedUser).toMatchObject({
      password: expect.any(String),
      bio: 'Updated bio',
    });
  });

  it('should throw UnauthorizedException when a user tries to update another person\'s profile', async () => {
    const userId = 2; // ID of the user whose profile is being updated
    const updateUserDto: UpdateUserDto = {
      password: 'newpassword',
      bio: 'Updated bio',
    };
    const req = { user: { role: Role.USER, id: 1 } }; // User ID 1 is logged in
  
    await expect(controller.update(userId, updateUserDto, req)).rejects.toThrow(UnauthorizedException);
  });

/*     it('should update the user password', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword',
      };
      const updatedUser = await controller.update(userId, updateUserDto);
  
      expect(updatedUser).toMatchObject({
        password: expect.any(String),
      });
  });  */
  it('should update the user password', async () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      password: 'newpassword',
    };
    const req = { user: { role: Role.USER, id: userId } };
  
    const updatedUser = await controller.update(userId, updateUserDto, req);
  
    expect(updatedUser).toMatchObject({
      password: expect.any(String),
    });
  });

   /*  it('should update the user bio', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        bio: 'Updated bio',
      };
      const updatedUser = await controller.update(userId, updateUserDto);

      expect(updatedUser).toMatchObject({
        bio: 'Updated bio',
      });
  }); */

  it('should update the user bio', async () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      bio: 'Updated bio',
    };
    const req = { user: { role: Role.USER, id: userId } };
  
    const updatedUser = await controller.update(userId, updateUserDto, req);
  
    expect(updatedUser).toMatchObject({
      bio: 'Updated bio',
    });
  });

 /*  it('should remove the user with the specified ID', async () => {
    const userId = 1;
    await controller.removeUser(userId)
    expect(mockUserService.removeUser).toHaveBeenCalledWith(userId);
  }); 
    */

  it('should successfully delete the user with the specified ID if called by an admin', async () => {
    const userId = 1;
    const req = { user: { role: Role.ADMIN } };
    mockUserService.removeUser.mockResolvedValue(true);
  
    const result = await controller.removeUser(userId, req);
  
    expect(result).toBe(true);
    expect(mockUserService.removeUser).toHaveBeenCalledWith(userId);
  });

  it('should throw UnauthorizedException if a non-admin user tries to delete a profile', async () => {
    const userId = 1;
    const req = { user: { role: Role.USER } };
  
    try {
      // Call the controller method to delete the user profile
      await controller.removeUser(userId, req);
  
      // If the code reaches this point, it means the exception was not thrown
      throw new Error('Expected UnauthorizedException to be thrown');
    } catch (error) {
      // Assert that the caught error is an instance of UnauthorizedException
      expect(error).toBeInstanceOf(UnauthorizedException);
  
      // Clear mock calls before asserting
      expect(mockUserService.removeUser).toHaveBeenCalledTimes(1);
      mockUserService.removeUser.mockClear();
    }
  });

  it('should throw a NotFoundException if the user with the specified ID is not found', async () => {
    const userId = 1;
    const req = { user: { role: Role.ADMIN } };
    mockUserService.removeUser.mockRejectedValue(new NotFoundException(`User with ID '${userId}' not found`));
  
    await expect(controller.removeUser(userId, req)).rejects.toThrow(NotFoundException);
    expect(mockUserService.removeUser).toHaveBeenCalledWith(userId);
  });

});
