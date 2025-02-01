import pygame
import multiprocessing
import time

def bouncing_ball(fps=30):
    pygame.init()
    width, height = 800, 600
    screen = pygame.display.set_mode((width, height))
    clock = pygame.time.Clock()

    ball_radius = 20
    x, y = width // 2, height // 2
    speed_x, speed_y = 5, 5

    running = True
    while running:
        screen.fill((0, 0, 0))
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                break
        
        x += speed_x
        y += speed_y

        if x - ball_radius < 0 or x + ball_radius > width:
            speed_x = -speed_x
        if y - ball_radius < 0 or y + ball_radius > height:
            speed_y = -speed_y

        pygame.draw.circle(screen, (255, 0, 0), (x, y), ball_radius)
        pygame.display.flip()
        clock.tick(fps)

    pygame.quit()

def start_bouncing_process(fps=30):
    process = multiprocessing.Process(target=bouncing_ball, args=(fps,))
    process.start()
    return process

if __name__ == "__main__":
    fps = 60  # Change this to configure frame rate
    process = start_bouncing_process(fps)
    
    try:
        while process.is_alive():
            time.sleep(1)
    except KeyboardInterrupt:
        process.terminate()
        process.join()
